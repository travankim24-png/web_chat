# app/routes/file_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import os, shutil, uuid

router = APIRouter(prefix="/files", tags=["files"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_SIZE = 64 * 1024 * 1024  # 64MB limit

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, filename)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # LUÔN trả về URL chuẩn có format /uploads/tenfile
    return {"file_url": f"/uploads/{filename}"}
