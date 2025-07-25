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

<<<<<<< HEAD
    def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """
        Get all chat sessions for a given user.

        Args:
            user_id (str): The user's identifier

        Returns:
            List[ChatSession]: List of chat sessions
        """
        try:
            resp = self.client.table('chat_sessions').select('*').eq('user_id', user_id).order('started_at').execute()
            return [ChatSession(**session) for session in (resp.data or [])]
        except Exception as e:
            print(f"Error getting user sessions: {str(e)}")
            import traceback
            print(f"Error traceback: {traceback.format_exc()}")
            raise

=======
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06
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
<<<<<<< HEAD
        try:
            print(f"Querying Supabase for messages with session_id: {session_id}")
            resp = self.client.table('chat_messages').select('*').eq('session_id', session_id).order('timestamp').execute()
            print(f"Supabase response: {resp}")
            print(f"Response data: {resp.data}")
            return [ChatMessage(**msg) for msg in (resp.data or [])]
        except Exception as e:
            print(f"Database error: {str(e)}")
            import traceback
            print(f"Database error traceback: {traceback.format_exc()}")
            raise
=======
        resp = self.client.table('chat_messages').select('*').eq('session_id', session_id).order('timestamp').execute()
        return [ChatMessage(**msg) for msg in (resp.data or [])]
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06

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
<<<<<<< HEAD
        return bool(resp.data)
=======
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06

# Initialize database service with environment variables
db_service = DatabaseService(
    url=os.getenv('SUPABASE_URL'),
    key=os.getenv('SUPABASE_KEY')
)
