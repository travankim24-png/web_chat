from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, crud, schemas, auth

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
            members.append({
                "id": m.user.id,
                "username": m.user.username,
                "avatar_url": m.user.avatar_url,          # ✅ Thêm avatar vào đây
                "display_name": m.user.display_name       # (Tùy chọn) cũng trả display_name
            })

        results.append({
            "id": c.id,
            "name": c.name,
            "is_group": c.is_group,
            "members": members
        })

    return results
