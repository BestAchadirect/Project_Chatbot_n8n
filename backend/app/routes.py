
"""
API routes module for chat application.
Defines all HTTP @router.get('/chat/sessions')
async def get_chat_sessions(user_id: Optional[str] = None):
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id parameter")
    try:
        sessions = db_service.get_user_sessions(user_id)
        print(f"Retrieved {len(sessions) if sessions else 0} sessions for user {user_id}")
        return {"sessions": [session.dict() for session in sessions]}
    except Exception as e:
        print(f"Error getting sessions: {str(e)}")
        import traceback
        print(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting sessions: {str(e)}")nts and WebSocket handlers.
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from fastapi import Depends
from .models.chat import ChatMessageRequest, ChatMessage, ChatSession
from .services.database import DatabaseService, db_service
from .services.n8n import N8NService, n8n_service

# Initialize router
router = APIRouter()

def get_db_service():
    return db_service

def get_n8n_service():
    return n8n_service

# Get webhook URL based on environment mode
N8N_WEBHOOK_MODE = os.getenv("N8N_WEBHOOK_MODE", "production")
N8N_WEBHOOK_URL = (
    "http://n8n:5678/webhook-test/returning-user" if N8N_WEBHOOK_MODE == "test"
    else "http://n8n:5678/webhook/returning-user"
)

# API Endpoints start here

# --- API Endpoints ---
@router.post('/chat/message')
async def chat_message(data: ChatMessageRequest):
    """
    Handle incoming chat messages and process responses.
    """
    session_id = data.sessionId
    message = data.message
    if not session_id or not message:
        raise HTTPException(status_code=400, detail="Missing sessionId or message")

    try:
        # Ensure session exists and save user message
        db_service.get_or_create_session(session_id)
        db_service.save_message(session_id, 'user', message)

        # Forward message to n8n and handle response
        response_json = await n8n_service.send_message(session_id, message)
        bot_message = n8n_service.extract_bot_message(response_json)
        
        if bot_message and isinstance(bot_message, str):
            db_service.save_message(session_id, 'bot', bot_message)
            response_json["response"] = bot_message.replace('\n', ' ')
        
        return JSONResponse(content=response_json)
    except Exception as e:
        print(f"Error contacting n8n: {e}")
        await db_service.save_message(session_id, 'bot', 'Sorry, something went wrong.')
        raise HTTPException(status_code=500, detail="Sorry, something went wrong.")

@router.get('/chat/sessions')
async def get_chat_sessions(user_id: Optional[str] = None):
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id parameter")
    sessions = db_service.get_user_sessions(user_id)
    return {"sessions": sessions}

@router.get('/chat/messages/{session_id}')
async def get_chat_messages(session_id: str):
    print(f"Received request for messages with session_id: {session_id}")
    try:
        print("Attempting to fetch messages from database...")
        messages = db_service.get_session_messages(session_id)
        print(f"Successfully retrieved {len(messages)} messages")
        return {"messages": [msg.dict() for msg in messages]}
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@router.post('/chat/session/{session_id}/end')
async def end_chat_session(session_id: str):
    success = db_service.end_session(session_id)
    if success:
        return {"message": "Session ended successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@router.get('/health')
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}