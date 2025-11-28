from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import db, models, auth, schemas

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------
# Lấy hồ sơ người dùng hiện tại
# ---------------------------------------------------------
@router.get("/me", response_model=schemas.UserProfile)
def get_me(current_user = Depends(auth.get_current_user)):
    return current_user


# ---------------------------------------------------------
# Cập nhật hồ sơ người dùng hiện tại
# ---------------------------------------------------------
@router.put("/me", response_model=schemas.UserProfile)
def update_me(
    payload: schemas.UserProfileUpdate,
    db_s: Session = Depends(db.get_db),
    current_user = Depends(auth.get_current_user)
):
    data = payload.dict(exclude_unset=True)

    # Vì birthday là string → không cần convert
    for field, value in data.items():
        setattr(current_user, field, value)

    db_s.commit()
    db_s.refresh(current_user)
    return current_user


# ---------------------------------------------------------
# Lấy danh sách tất cả user
# ---------------------------------------------------------
@router.get("/all")
def get_all_users(
    current_user = Depends(auth.get_current_user),
    db_s: Session = Depends(db.get_db)
):
    users = db_s.query(models.User).filter(models.User.id != current_user.id).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "avatar_url": u.avatar_url,
            "display_name": u.display_name
        }
        for u in users
    ]


# ---------------------------------------------------------
# Lấy hồ sơ user bất kỳ
# ---------------------------------------------------------
@router.get("/{user_id}", response_model=schemas.UserProfile)
def get_user_profile(user_id: int, db_s: Session = Depends(db.get_db)):
    user = db_s.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
