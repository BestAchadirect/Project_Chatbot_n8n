from flask import Blueprint, request, jsonify
from .database import SessionLocal
from .models import ChatSession, ChatMessage, UserInfo
from uuid import UUID
from datetime import datetime, timezone
import requests

api_routes = Blueprint("api", __name__)

def parse_user_info(text):
    parts = [part.strip() for part in text.split(',')]
    if len(parts) == 3:
        name, email, country = parts
        return {"name": name, "email": email, "country": country}
    return None

@api_routes.route("/api/session", methods=["POST"])
def handle_session():
    data = request.get_json()
    session_id = data.get("sessionId", "")
    user_id = data.get("userId", "")
    chat_input = data.get("chatInput", "")

    if not session_id or not user_id or not chat_input:
        return jsonify({"error": "Missing required fields"}), 400

    db = None
    try:
        db = SessionLocal()

        # Validate session_id as UUID
        try:
            session_id = UUID(session_id)
        except ValueError:
            return jsonify({"error": "Invalid session ID format"}), 400

        # Parse user information from the message
        user_info = parse_user_info(chat_input)

        if user_info:
            # Check if the user already exists in the database
            existing_user = db.query(UserInfo).filter_by(email=user_info["email"]).first()
            if not existing_user:
                # Save user information to the database
                new_user = UserInfo(
                    name=user_info["name"],
                    email=user_info["email"],
                    country=user_info["country"]
                )
                db.add(new_user)
                db.commit()

            # Generate success bot response
            bot_response = "✅ Thanks! We've saved your information. How can I assist you today?"

            # Save bot response
            bot_message = ChatMessage(
                session_id=session_id,
                sender="bot",
                message=bot_response,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(bot_message)

            # Save user message
            user_message = ChatMessage(
                session_id=session_id,
                sender="user",
                message=chat_input,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(user_message)

            db.commit()
            return jsonify({"response": bot_response})

        else:
            # Generate error bot response prompting for correct format
            bot_response = (
                "👋 Before we continue, please share your **name, email, and country**.\n"
                "Format it like this: `John Smith, john@example.com, Canada`"
            )

            # Save bot response
            bot_message = ChatMessage(
                session_id=session_id,
                sender="bot",
                message=bot_response,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(bot_message)

            db.commit()
            return jsonify({"response": bot_response})

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()


@api_routes.route("/api/faq", methods=["POST"])
def handle_faq():
    """
    Directly sends user input to the FAQ webhook.
    """
    data = request.get_json()
    session_id = data.get("sessionId", "")
    user_id = data.get("userId", "")
    chat_input = data.get("chatInput", "")

    if not session_id or not user_id or not chat_input:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Send the user input to the FAQ webhook
        n8n_webhook_url = "http://localhost:5678/webhook-test/returning-user"
        payload = {
            "userId": user_id,
            "sessionId": session_id,
            "chatInput": chat_input
        }

        response = requests.post(n8n_webhook_url, json=payload)
        response.raise_for_status()

        # Log success
        print(f"Successfully sent to 'returning user' webhook: {response.status_code}")

        # Generate bot response
        bot_response = "Your query has been sent to our FAQ system. Please wait for a response."

        return jsonify({"response": bot_response})

    except requests.exceptions.RequestException as e:
        print(f"Error sending to 'returning user' webhook: {str(e)}")
        return jsonify({"error": "Failed to send query to FAQ system."}), 500