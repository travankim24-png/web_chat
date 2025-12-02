from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, crud, schemas, auth, models

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.post("/")
def create_conv(
    payload: schemas.ConversationCreate,
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    conv = crud.create_conversation(
        db_s,
        payload.name,
        payload.is_group,
        payload.member_ids,
        current_user.id
    )
    return {"id": conv.id, "name": conv.name, "is_group": conv.is_group}


@router.get("/mine")
def my_convs(
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    convs = crud.get_conversations_by_user(db_s, current_user.id)
    
    results = []
    for c in convs:
        members = []
        for m in c.members:
            # m là ConversationMember instance; m.user là User
            members.append({
                "id": m.user.id,
                "username": m.user.username,
                "avatar_url": m.user.avatar_url,
                "display_name": m.user.display_name,
                # Trả nickname nếu có trên ConversationMember
                "nickname": getattr(m, "nickname", None)
            })

        results.append({
            "id": c.id,
            "name": c.name,
            "is_group": c.is_group,
            "members": members
        })

    return results


@router.put("/nickname")
def update_nickname(
    conversation_id: int,
    user_id: int,
    nickname: str,
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    # Chỉ cập nhật nếu bạn là thành viên conversation
    member = db_s.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == conversation_id,
        models.ConversationMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.nickname = nickname
    db_s.commit()
    db_s.refresh(member)

    return {"message": "Nickname updated", "nickname": nickname}