from flask import Blueprint, request, jsonify
import requests

api_routes = Blueprint('api_routes', __name__)

@api_routes.route('/chat/message', methods=['POST'])
def chat_message():
    data = request.get_json()
    # Forward the message to n8n and return n8n's response to the frontend
    try:
        n8n_response = requests.post(
            "http://localhost:5678/webhook-test/returning-user",
            json=data,
            timeout=10
        )
        n8n_response.raise_for_status()
        response_json = n8n_response.json()
        if "response" in response_json and isinstance(response_json["response"], str):
            response_json["response"] = response_json["response"].replace('\n', ' ')
        return jsonify(response_json)
    except Exception as e:
        print(f"Error contacting n8n: {e}")
        return jsonify({"error": "Sorry, something went wrong."}), 500