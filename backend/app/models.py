from .database import Base
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    user_info_id = Column(UUID(as_uuid=True), ForeignKey("user_info.id"), nullable=True)  # Add foreign key
    started_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime, nullable=True)

    user = relationship("UserInfo", back_populates="sessions")  # Define relationship

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.session_id"), nullable=False)
    sender = Column(String(10), nullable=False)  # 'user' or 'bot'
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

class UserInfo(Base):
    __tablename__ = "user_info"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    country = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    sessions = relationship("ChatSession", back_populates="user")  # Define relationship


class FAQIntent(Base):
    __tablename__ = "faq_intent"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intent_name = Column(String(100), nullable=False, unique=True)
    user_input = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    topic = Column(String(100), nullable=True)
    source = Column(String(50), default="manual")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)