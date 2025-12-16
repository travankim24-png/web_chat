# settings_routes.py
from fastapi import APIRouter, Depends, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app import db, auth, crud, models
from app.schemas import UserProfileUpdate, NicknameUpdate, ThemeUpdate
import os

router = APIRouter(prefix="/settings", tags=["Settings"])


# ============================================================
# 1. Cập nhật hồ sơ người dùng
# ============================================================
@router.put("/profile")
def update_profile(
    data: UserProfileUpdate,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):
    updated = crud.update_user_profile(
        db_s,
        current_user.id,
        **data.dict(exclude_unset=True)
    )
    return updated


# ============================================================
# 2. Upload avatar
# ============================================================
@router.post("/avatar")
def upload_avatar(
    file: UploadFile,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):
    folder = "app/uploads/avatars"
    os.makedirs(folder, exist_ok=True)

    file_path = f"{folder}/{current_user.id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    db_path = file_path.replace("app", "")

    crud.update_user_avatar(db_s, current_user.id, db_path)

    return {"avatar_url": db_path}


# ============================================================
# 3. Đổi mật khẩu
# ============================================================
@router.put("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):
    if not auth.verify_password(old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")

    crud.change_password(db_s, current_user.id, new_password)
    return {"message": "Password updated"}


# ============================================================
# 4. Đặt biệt danh (1-1 hoặc group)
# ============================================================
@router.put("/nickname")
def set_nickname(
    data: NicknameUpdate,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):

    # USER KHÁC KHÔNG ĐƯỢC ĐỔI BIỆT DANH CHO NGƯỜI KHÁC TRONG CHAT 1-1
    conv = crud.get_conversation(db_s, data.conversation_id)

    if not conv:
        raise HTTPException(status_code=404, detail="Hội thoại không tồn tại")

    if not conv.is_group and data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không thể đổi biệt danh cho người khác trong chat 1-1")

    updated = crud.update_nickname(
        db_s,
        data.conversation_id,
        data.user_id,
        data.nickname
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên")

    return {"nickname": data.nickname, "user_id": data.user_id}


# ============================================================
# 5. Rời nhóm
# ============================================================
@router.post("/leave")
def leave_group(
    data: dict,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):

    conversation_id = data.get("conversation_id")
    if not conversation_id:
        raise HTTPException(status_code=400, detail="Thiếu conversation_id")

    ok = crud.leave_group(db_s, conversation_id, current_user.id)

    if not ok:
        raise HTTPException(status_code=400, detail="Bạn không thuộc nhóm này")

    return {"message": "Rời nhóm thành công"}


# ============================================================
# 6. Xóa hội thoại
# ============================================================
@router.delete("/delete/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):

    ok = crud.delete_conversation(db_s, conversation_id)

    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy hội thoại")

    return {"message": "Xóa hội thoại thành công"}

@router.put("/theme")
def set_theme(
    data: ThemeUpdate,
    db_s: Session = Depends(db.get_db),
    current_user=Depends(auth.get_current_user)
):
    conv = db_s.query(models.Conversation).filter(
        models.Conversation.id == data.conversation_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    member = db_s.query(models.ConversationMember).filter(
        models.ConversationMember.conversation_id == data.conversation_id,
        models.ConversationMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Bạn không thuộc nhóm này")

    conv.theme = data.theme
    db_s.commit()
    db_s.refresh(conv)

    return {
        "message": "Theme updated",
        "theme": data.theme
    }