from sqlalchemy.orm import Session
from sqlalchemy import delete
from . import models, auth
from datetime import datetime


# ============================================================
# USER
# ============================================================
def create_user(db: Session, username: str, email: str, password: str):
    hashed = auth.get_password_hash(password)
    user = models.User(username=username, email=email, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def update_user_profile(db: Session, user_id: int, **fields):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    for k, v in fields.items():
        setattr(user, k, v)

    db.commit()
    db.refresh(user)
    return user


def update_user_avatar(db: Session, user_id: int, avatar_url: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: int, new_password: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    user.password_hash = auth.get_password_hash(new_password)
    db.commit()
    return True


# ============================================================
# CONVERSATION
# ============================================================
def create_conversation(db: Session, name: str, is_group: bool, member_ids: list, creator_id: int):
    conv = models.Conversation(name=name, is_group=is_group)
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Add creator
    member_ids = set(member_ids)
    member_ids.add(creator_id)

    for uid in member_ids:
        db.add(models.ConversationMember(conversation_id=conv.id, user_id=uid))

    db.commit()
    return conv


def get_conversations_by_user(db: Session, user_id: int):
    return (
        db.query(models.Conversation)
        .join(models.ConversationMember)
        .filter(models.ConversationMember.user_id == user_id)
        .all()
    )


def update_nickname(db: Session, conversation_id: int, user_id: int, nickname: str):
    member = db.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id,
        models.ConversationMember.user_id == user_id
    ).first()

    if not member:
        return None

    member.nickname = nickname
    db.commit()
    db.refresh(member)
    return member


def leave_group(db: Session, conversation_id: int, user_id: int):
    member = db.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id,
        models.ConversationMember.user_id == user_id
    ).first()

    if not member:
        return False

    db.delete(member)
    db.commit()

    # Nếu phòng không còn ai → xoá luôn
    remaining = db.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id
    ).count()

    if remaining == 0:
        delete_conversation(db, conversation_id)

    return True


def remove_member(db: Session, conversation_id: int, member_id: int):
    member = db.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id,
        models.ConversationMember.user_id == member_id
    ).first()

    if not member:
        return False

    db.delete(member)
    db.commit()
    return True


def get_conversation(db: Session, conversation_id: int):
    return db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()


# ============================================================
# DELETE CONVERSATION
# ============================================================
def delete_conversation(db: Session, conversation_id: int):
    conv = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conv:
        return False

    # Xoá media files
    db.query(models.Media).filter(
        models.Media.conversation_id == conversation_id
    ).delete(synchronize_session=False)

    # Xoá seen
    db.query(models.MessageSeen).filter(
        models.MessageSeen.message_id.in_(
            db.query(models.Message.id).filter(models.Message.conversation_id == conversation_id)
        )
    ).delete(synchronize_session=False)

    # Xoá messages
    db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).delete(synchronize_session=False)

    # Xoá members
    db.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id
    ).delete(synchronize_session=False)

    # Xoá hội thoại
    db.delete(conv)
    db.commit()
    return True


# ============================================================
# MESSAGE
# ============================================================
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


# ============================================================
# MEDIA
# ============================================================
def save_media(db: Session, conversation_id: int, sender_id: int, file_url: str, is_image: bool):
    media = models.Media(
        conversation_id=conversation_id,
        sender_id=sender_id,
        url=file_url,
        is_image=is_image
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


def get_media(db: Session, conversation_id: int):
    images = db.query(models.Media).filter(
        models.Media.conversation_id == conversation_id,
        models.Media.is_image == True
    ).all()

    files = db.query(models.Media).filter(
        models.Media.conversation_id == conversation_id,
        models.Media.is_image == False
    ).all()

    return {"images": images, "files": files}

# ============================================================
# MESSAGE REACTION
# ============================================================
def add_or_update_reaction(db, message_id, user_id, emoji):
    from .models import MessageReaction

    reaction = db.query(MessageReaction).filter(
        MessageReaction.message_id == message_id,
        MessageReaction.user_id == user_id
    ).first()

    if reaction:
        reaction.emoji = emoji
    else:
        reaction = MessageReaction(
            message_id=message_id,
            user_id=user_id,
            emoji=emoji
        )
        db.add(reaction)

    db.commit()
    db.refresh(reaction)
    return reaction

def get_message_reactions(db: Session, message_id: int):
    from .models import MessageReaction, User
    rows = (
        db.query(MessageReaction.emoji, User.username)
        .join(User, User.id == MessageReaction.user_id)
        .filter(MessageReaction.message_id == message_id)
        .all()
    )

    result = {}
    for emoji, username in rows:
        if emoji not in result:
            result[emoji] = {
                "emoji": emoji,
                "count": 0,
                "users": []
            }
        result[emoji]["count"] += 1
        result[emoji]["users"].append(username)

    return list(result.values())
