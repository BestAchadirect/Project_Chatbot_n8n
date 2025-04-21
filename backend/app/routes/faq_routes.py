from flask import Blueprint, jsonify, request
from app.services.faq_service import create_chat_session

faq_routes = Blueprint('faq_routes', __name__)

@faq_routes.route('/api/session', methods=['POST'])
def create_session():
    data = request.get_json()
    user_id = data.get('user_id', "")
    session_id = create_chat_session(user_id=user_id)
    return jsonify({"session_id": session_id})
