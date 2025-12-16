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
    content: Optional[str] = None
    file_url: Optional[str] = None

class SeenUser(BaseModel):
    id: int
    user_id: int
    seen_at: datetime

    class Config:
        orm_mode = True

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime
    seen_by: Optional[List[SeenUser]] = None

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str]
    display_name: Optional[str]
    bio: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    birthday: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[str] = None
    avatar_url: Optional[str] = None

class NicknameUpdate(BaseModel):
    conversation_id: int
    user_id: int
    nickname: str

class ConversationMemberSchema(BaseModel):
    user_id: int
    username: str | None
    display_name: str | None
    avatar_url: str | None
    nickname: str | None

    class Config:
        orm_mode = True

class ThemeUpdate(BaseModel):
    conversation_id: int
    theme: str