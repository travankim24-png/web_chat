from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, models, auth

router = APIRouter(prefix="/media", tags=["media"])

@router.get("/{conversation_id}")
def get_media(conversation_id: int,
              db_s: Session = Depends(db.get_db),
              current_user = Depends(auth.get_current_user)):

    # Lấy toàn bộ tin nhắn có file
    files = db_s.query(models.Message).filter(
        models.Message.conversation_id == conversation_id,
        models.Message.file_url.isnot(None)
    ).all()

    images = []
    documents = []

    for m in files:
        url = m.file_url.lower()

        if url.endswith((".jpg", ".png", ".jpeg", ".gif", ".webp")):
            images.append({
                "id": m.id,
                "url": m.file_url,
                "created_at": m.created_at
            })
        else:
            documents.append({
                "id": m.id,
                "url": m.file_url,
                "created_at": m.created_at,
                "filename": url.split("/")[-1]
            })

    return {
        "images": images,
        "files": documents
    }
