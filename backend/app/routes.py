from flask import Blueprint, request, jsonify, session
from flask_socketio import emit, join_room, leave_room
import requests
from datetime import datetime, timezone
import uuid
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

api_routes = Blueprint('api_routes', __name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@api_routes.route('/chat/message', methods=['POST'])
def chat_message():
    data = request.get_json()
    session_id = data.get('sessionId')
    message = data.get('message')
    
    if not session_id or not message:
        return jsonify({"error": "Missing sessionId or message"}), 400
    
    # Create or get chat session
    session_resp = supabase.table('chat_sessions').select('*').eq('session_id', session_id).execute()
    if not session_resp.data:
        supabase.table('chat_sessions').insert({
            'session_id': session_id,
            'user_id': f"user_{session_id[:8]}",
            'started_at': datetime.now(timezone.utc).isoformat(),
            'ended_at': None
        }).execute()
    
    # Save user message
    supabase.table('chat_messages').insert({
        'session_id': session_id,
        'sender': 'user',
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }).execute()
    
    # Forward the message to n8n and return n8n's response to the frontend
    try:
        n8n_response = requests.post(
            "http://localhost:5678/webhook-test/returning-user",
            json=data,
            timeout=30
        )
        n8n_response.raise_for_status()
        response_json = n8n_response.json()

        # Extract bot message from possible locations
        bot_message = None
        if isinstance(response_json, dict):
            # Check top-level 'response' or 'markdown'
            bot_message = response_json.get("response") or response_json.get("markdown")
            # Check nested 'data.response'
            if not bot_message and isinstance(response_json.get("data"), dict):
                bot_message = response_json["data"].get("response")
        
        # Save bot response to database if found
        if bot_message and isinstance(bot_message, str):
            supabase.table('chat_messages').insert({
                'session_id': session_id,
                'sender': 'bot',
                'message': bot_message,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }).execute()
            response_json["response"] = bot_message.replace('\n', ' ')
        
        return jsonify(response_json)
    except Exception as e:
        print(f"Error contacting n8n: {e}")
        # Save error bot message to database
        supabase.table('chat_messages').insert({
            'session_id': session_id,
            'sender': 'bot',
            'message': 'Sorry, something went wrong.',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }).execute()
        return jsonify({"error": "Sorry, something went wrong."}), 500

@api_routes.route('/chat/sessions', methods=['GET'])
def get_chat_sessions():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400
    
    resp = supabase.table('chat_sessions').select('*').eq('user_id', user_id).order('started_at', desc=True).execute()
    sessions = resp.data or []
    return jsonify({
        "sessions": [
            {
                "session_id": s['session_id'],
                "started_at": s['started_at'],
                "ended_at": s.get('ended_at')
            } for s in sessions
        ]
    })

@api_routes.route('/chat/messages/<session_id>', methods=['GET'])
def get_chat_messages(session_id):
    resp = supabase.table('chat_messages').select('*').eq('session_id', session_id).order('timestamp').execute()
    messages = resp.data or []
    return jsonify({
        "messages": [
            {
                "message_id": m.get('message_id', ''),
                "sender": m['sender'],
                "message": m['message'],
                "timestamp": m['timestamp']
            } for m in messages
        ]
    })

@api_routes.route('/chat/session/<session_id>/end', methods=['POST'])
def end_chat_session(session_id):
    resp = supabase.table('chat_sessions').update({'ended_at': datetime.now(timezone.utc).isoformat()}).eq('session_id', session_id).execute()
    if resp.data:
        return jsonify({"message": "Session ended successfully"})
    else:
        return jsonify({"error": "Session not found"}), 404

@api_routes.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()})