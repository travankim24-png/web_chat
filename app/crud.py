from sqlalchemy.orm import Session
from . import models, auth
from datetime import datetime

def create_user(db: Session, username: str, email: str, password: str):
    hashed = auth.get_password_hash(password)
    user = models.User(username=username, email=email, password_hash=hashed)
    db.add(user); db.commit(); db.refresh(user)
    return user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_conversation(db: Session, name: str, is_group: bool, member_ids: list, creator_id: int):
    from .models import Conversation, ConversationMember, User

    # ✅ Tạo hội thoại
    conv = Conversation(name=name, is_group=is_group)
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # ✅ Thêm người tạo hội thoại vào danh sách (nếu chưa có)
    all_member_ids = set(member_ids)
    all_member_ids.add(creator_id)

    # ✅ Thêm tất cả vào bảng trung gian conversation_members
    for uid in all_member_ids:
        db.add(ConversationMember(conversation_id=conv.id, user_id=uid))

    db.commit()
    return conv



def get_conversations_by_user(db: Session, user_id: int):
    return (
        db.query(models.Conversation)
        .join(models.ConversationMember)
        .filter(models.ConversationMember.user_id == user_id)
        .all()
    )

def save_message(db: Session, conversation_id: int, sender_id: int, content: str = None, file_url: str = None):
    msg = models.Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        file_url=file_url,
        created_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg