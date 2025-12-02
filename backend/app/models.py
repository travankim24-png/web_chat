from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base


# ============================================================
# USER
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    avatar_url = Column(String(255), nullable=True)
    display_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    birthday = Column(String(20), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("ConversationMember", back_populates="user")


# ============================================================
# CONVERSATION
# ============================================================
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    is_group = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("ConversationMember", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation")

    media_items = relationship("Media", back_populates="conversation")


# ============================================================
# CONVERSATION MEMBER
# ============================================================
class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    nickname = Column(String(100), nullable=True)

    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User", back_populates="conversations")


# ============================================================
# MESSAGE
# ============================================================
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))

    content = Column(Text, nullable=True)
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

    seen_by = relationship("MessageSeen", back_populates="message")


# ============================================================
# MESSAGE SEEN
# ============================================================
class MessageSeen(Base):
    __tablename__ = "message_seen"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    seen_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="seen_by")


# ============================================================
# MEDIA — ảnh & file
# ============================================================
class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))

    url = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=True)

    is_image = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="media_items")
