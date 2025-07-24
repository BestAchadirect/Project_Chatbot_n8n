"""
Database service module for chat application.
Handles all interactions with Supabase database.
"""

from datetime import datetime, timezone
from typing import List, Optional
from supabase import Client, create_client
import os
from ..models.chat import ChatMessage, ChatSession

class DatabaseService:
    """
    Service class for handling all database operations.
    Manages chat sessions and messages using Supabase.
    """
    
    def __init__(self, url: str, key: str):
        """
        Initialize database service with Supabase credentials.
        
        Args:
            url (str): Supabase project URL
            key (str): Supabase API key
        """
        self.client: Client = create_client(url, key)

    def get_or_create_session(self, session_id: str) -> None:
        """
        Retrieve existing session or create new one.
        
        Args:
            session_id (str): Unique session identifier
            
        Returns:
            None
        """
        session_resp = self.client.table('chat_sessions').select('*').eq('session_id', session_id).execute()
        if not session_resp.data:
            self.client.table('chat_sessions').insert({
                'session_id': session_id,
                'user_id': f"user_{session_id[:8]}",
                'started_at': datetime.now(timezone.utc).isoformat(),
                'ended_at': None
            }).execute()

    def save_message(self, session_id: str, sender: str, message: str) -> None:
        """
        Save a new message to the database.
        
        Args:
            session_id (str): Session identifier
            sender (str): Message sender ('user', 'bot', or 'system')
            message (str): Message content
            
        Returns:
            None
        """
        self.client.table('chat_messages').insert({
            'session_id': session_id,
            'sender': sender,
            'message': message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }).execute()

    def get_session_messages(self, session_id: str) -> List[ChatMessage]:
        """
        Retrieve all messages for a given session.
        
        Args:
            session_id (str): Session identifier
            
        Returns:
            List[ChatMessage]: List of chat messages
        """
        resp = self.client.table('chat_messages').select('*').eq('session_id', session_id).order('timestamp').execute()
        return [ChatMessage(**msg) for msg in (resp.data or [])]

    def end_session(self, session_id: str) -> bool:
        """
        Mark a session as ended.
        
        Args:
            session_id (str): Session identifier
            
        Returns:
            bool: True if session was successfully ended
        """
        resp = self.client.table('chat_sessions').update({
            'ended_at': datetime.now(timezone.utc).isoformat()
        }).eq('session_id', session_id).execute()
        return bool(resp.data)

# Initialize database service with environment variables
db_service = DatabaseService(
    url=os.getenv('SUPABASE_URL'),
    key=os.getenv('SUPABASE_KEY')
)
