# app/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str]
    created_at: datetime
    class Config:
        orm_mode = True

class ConversationCreate(BaseModel):
    name: Optional[str]
    is_group: bool = False
    member_ids: List[int]

class MessageCreate(BaseModel):
    conversation_id: int
    sender_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str]
    file_url: Optional[str]
    created_at: datetime
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    username: str
    password: str
