# app/services/faq_service.py
from app.models.faq_model import ChatSession
from app.config import db

def create_chat_session(user_id=""):
    new_session = ChatSession(user_id=user_id)
    db.session.add(new_session)
    db.session.commit()
    return str(new_session.session_id)
