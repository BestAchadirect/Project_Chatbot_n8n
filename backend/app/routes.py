import re
from uuid import UUID
from datetime import datetime, timezone
from flask import request, jsonify, Blueprint
from .database import SessionLocal
from .models import ChatSession, ChatMessage, UserInfo
import requests
import uuid

api_routes = Blueprint('api_routes', __name__)

def parse_user_info(text):
    parts = [part.strip() for part in text.split(',')]
    if len(parts) == 3:
        name, email, country = parts
        return {"name": name, "email": email, "country": country}
    return None

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def save_user_message(db, session_id, message):
    user_message = ChatMessage(
        session_id=session_id,
        sender="user",
        message=message,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(user_message)

def save_bot_message(db, session_id, message):
    bot_message = ChatMessage(
        session_id=session_id,
        sender="bot",
        message=message,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(bot_message)

def get_or_create_session(db, session_id, user_id):
    session = db.query(ChatSession).filter_by(session_id=session_id).first()
    if not session:
        session = ChatSession(
            session_id=session_id,
            user_id=user_id,
            started_at=datetime.now(timezone.utc)
        )
        db.add(session)
        db.commit()
    return session

def get_or_create_user(db, user_info):
    user = db.query(UserInfo).filter_by(email=user_info["email"]).first()
    if not user:
        user = UserInfo(
            name=user_info["name"],
            email=user_info["email"],
            country=user_info["country"],
            created_at=datetime.now(timezone.utc)
        )
        db.add(user)
        db.commit()
    return user

@api_routes.route("/api/session", methods=["POST"])
def handle_session():
    data = request.get_json()
    session_id = data.get("sessionId", "")
    user_id = data.get("userId", "")
    chat_input = data.get("chatInput", "")

    # Handle missing sessionId or userId for new customers
    if not session_id:
        session_id = str(uuid.uuid4())  # Generate a new sessionId
    if not user_id:
        user_id = f"guest_{uuid.uuid4().hex[:8]}"  # Generate a new userId

    if not chat_input:
        return jsonify({"error": "Missing required fields"}), 400

    db = None
    try:
        db = SessionLocal()

        # Validate session_id
        try:
            session_id = UUID(session_id)
        except ValueError:
            return jsonify({"error": "Invalid session ID format"}), 400

        # Retrieve or create chat session
        session = get_or_create_session(db, session_id, user_id)
        save_user_message(db, session_id, chat_input)

        # Check if user information is already linked to the session
        if session.user_info_id:
            bot_response = "How can I assist you today?"
            save_bot_message(db, session_id, bot_response)
            db.commit()

            # Send subsequent messages to the webhook
            return jsonify({"response": bot_response, "nextEndpoint": "/webhook-test/returning-user"})

        # Parse and validate user info from input
        user_info = parse_user_info(chat_input)
        if user_info and is_valid_email(user_info["email"]):
            # Look up user by email
            existing_user = db.query(UserInfo).filter_by(email=user_info["email"]).first()
            if not existing_user:
                new_user = UserInfo(
                    name=user_info["name"],
                    email=user_info["email"],
                    country=user_info["country"],
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_user)
                db.commit()
                user = new_user
            else:
                user = existing_user

            # Link session to user
            session.user_info_id = user.id
            db.commit()

            # Respond success
            bot_response = "✅ Thanks! We've saved your information. How can I assist you today?"
            save_bot_message(db, session_id, bot_response)
            db.commit()

            # Return response with next endpoint
            return jsonify({"response": bot_response, "nextEndpoint": "/webhook-test/returning-user"})

        else:
            # Prompt user to correct format
            bot_response = (
                "👋 Before we continue, please share your **name, email, and country**.\n"
                "Format it like this: `John Smith, john@example.com, Canada`"
            )
            save_bot_message(db, session_id, bot_response)
            db.commit()
            return jsonify({"response": bot_response, "sessionId": str(session_id), "userId": user_id})

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()