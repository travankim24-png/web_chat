from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, crud, schemas, auth, models

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/", response_model=schemas.MessageOut)
def send_message(
    payload: schemas.MessageCreate,
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    conv = db_s.query(models.Conversation).filter(models.Conversation.id == payload.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail=f"Conversation {payload.conversation_id} not found")

    member_ids = [m.user_id for m in conv.members]
    if current_user.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this conversation")

    msg = crud.save_message(
        db=db_s,
        conversation_id=payload.conversation_id,
        sender_id=current_user.id,
        content=payload.content,
        file_url=payload.file_url
    )
    return msg


@router.get("/{conversation_id}", response_model=list[schemas.MessageOut])
def get_messages(
    conversation_id: int,
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    conv = db_s.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    member_ids = [m.user_id for m in conv.members]
    if current_user.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this conversation")

    messages = (
        db_s.query(models.Message)
        .filter(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.created_at)
        .all()
    )
    return messages
