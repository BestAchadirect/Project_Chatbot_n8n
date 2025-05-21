from .database import Base
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, JSON
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
    __tablename__ = "faq_intents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intent_name = Column(String(100), nullable=False, unique=True)

    # Multiple examples (optional JSON array), can also stay Text if simpler
    training_phrases = Column(JSON, nullable=False)

    # Response detail and type
    response_text = Column(Text, nullable=False)
    response_type = Column(String(50), default="text")  # could be: text, html, card, etc.

    topic = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)  # Optional tags for better categorization

    source = Column(String(50), default="manual")
    language = Column(String(10), default="en")  # ISO codes for i18n support

    is_active = Column(Boolean, default=True)  # For soft delete / filtering
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
