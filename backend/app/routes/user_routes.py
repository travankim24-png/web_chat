# app/routes/user_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, models, auth

router = APIRouter(prefix="/users", tags=["users"])

# ✅ Lấy thông tin user hiện tại
@router.get("/me")
def get_me(current_user = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }

# ✅ (tuỳ chọn) Lấy danh sách tất cả user (trừ chính mình)
@router.get("/all")
def get_all_users(current_user = Depends(auth.get_current_user),
                  db_s: Session = Depends(db.get_db)):
    users = db_s.query(models.User).filter(models.User.id != current_user.id).all()
    return [{"id": u.id, "username": u.username, "email": u.email} for u in users]
