from flask import Blueprint, request, jsonify
import requests
import os
import supabase

bp = Blueprint('chat', __name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

@bp.route('/chat/message', methods=['POST'])
def chat_message():
    data = request.get_json()
    session_id = data.get("sessionId", "")
    message = data.get("message", "")

    # Fetch chat history from Supabase
    try:
        response = supabase_client.table("n8n_chat_histories").select("*").eq("session_id", session_id).execute()
        chat_history = response.data
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return jsonify({"response": "Sorry, could not fetch chat history."}), 500

    # Forward the message to n8n (optional, remove if not needed)
    try:
        n8n_response = requests.post(
            "http://localhost:5678/webhook-test/returning-user",
            json={"sessionId": session_id, "message": message, "history": chat_history},
            timeout=10
        )
        n8n_response.raise_for_status()
        n8n_data = n8n_response.json()
        bot_response = n8n_data.get("response", "No response received.")
    except Exception as e:
        print(f"Error contacting n8n: {e}")
        return jsonify({"response": "Sorry, something went wrong."}), 500

    # Forward the bot response and history to the frontend
    return jsonify({
        "response": bot_response,
        "history": chat_history
    })