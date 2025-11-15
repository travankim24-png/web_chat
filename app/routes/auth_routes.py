from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, db, auth

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: schemas.UserCreate, db_s: Session = Depends(db.get_db)):
    if crud.get_user_by_username(db_s, user.username):
        raise HTTPException(400, "Username taken")
    return crud.create_user(db_s, user.username, user.email, user.password)

@router.post("/login")
def login(payload: schemas.LoginRequest, db_s: Session = Depends(db.get_db)):
    user = crud.get_user_by_username(db_s, payload.username)
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "username": user.username}}
