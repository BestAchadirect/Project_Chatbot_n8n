"""
Models module for the chat application.
Contains Pydantic models for request/response validation and database models.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChatMessageRequest(BaseModel):
    """
    Model for incoming chat message requests.
    
    Attributes:
        sessionId (str): Unique identifier for the chat session
        message (str): The message content from the user
    """
    sessionId: str = Field(..., description="Unique identifier for the chat session")
    message: str = Field(..., description="The message content from the user")

class ChatMessage(BaseModel):
    """
    Model for chat messages stored in the database.
    
    Attributes:
        message_id (str, optional): Unique identifier for the message
        sender (str): Identity of the message sender ('user', 'bot', or 'system')
        message (str): The actual message content
        timestamp (datetime): When the message was sent/received
    """
    message_id: Optional[str] = None
    sender: str
    message: str
    timestamp: datetime

class ChatSession(BaseModel):
    """
    Model for chat sessions stored in the database.
    
    Attributes:
        session_id (str): Unique identifier for the session
        user_id (str): Identifier for the user
        started_at (datetime): When the session started
        ended_at (Optional[datetime]): When the session ended, if applicable
    """
    session_id: str
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
