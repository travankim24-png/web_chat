# app/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import db, models, auth
from .routes import (
    auth_routes,
    conversation_routes,
    file_routes,
    user_routes,
    message_routes,
    settings_routes,
    media_routes
)

from .websocket_manager import manager

from starlette.concurrency import run_in_threadpool
from fastapi.openapi.utils import get_openapi
import json

app = FastAPI(title="Chat backend (FastAPI)")


# -------------------------------------------------------------
# CORS
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# Include routes
# -------------------------------------------------------------
app.include_router(auth_routes.router)
app.include_router(conversation_routes.router)
app.include_router(file_routes.router)
app.include_router(user_routes.router)
app.include_router(message_routes.router)
app.include_router(settings_routes.router)
app.include_router(media_routes.router)


# -------------------------------------------------------------
# DB init
# -------------------------------------------------------------
models.Base.metadata.create_all(bind=db.engine)


# -------------------------------------------------------------
# Static: serve uploaded files
# -------------------------------------------------------------
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# -------------------------------------------------------------
# WEBSOCKET ENDPOINT – ANTI CRASH VERSION
# -------------------------------------------------------------
@app.websocket("/ws/{conversation_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    user_id: int,
    token: str = Query(None)
):
    # 1. Validate JWT
    payload = auth.decode_access_token(token) if token else None
    if not payload or str(payload.get("sub")) != str(user_id):
        await websocket.close(code=1008)
        return

    # 2. Accept WS
    await websocket.accept()

    # 3. Register connection
    await manager.connect(conversation_id, user_id, websocket)

    # 4. Send list of online users to this user
    try:
        await websocket.send_json({
            "type": "online_list",
            "users": manager.get_online_users(conversation_id)
        })
    except:
        pass  # user có thể disconnect ngay lập tức

    # 5. Notify everyone that this user is online
    await manager.broadcast_safe(
        conversation_id,
        {
            "type": "presence",
            "user_id": user_id,
            "status": "online"
        },
        exclude_user=None
    )

    try:
        while True:
            # Nhận dữ liệu từ WS
            raw = await websocket.receive_text()
            payload = json.loads(raw)

            # ======================================================
            # SEND MESSAGE
            # ======================================================
            if payload.get("type") == "message":
                content = payload.get("content")
                file_url = payload.get("file_url")

                # save_message chạy trong threadpool
                def save_msg():
                    db_s = next(db.get_db())
                    try:
                        from .crud import save_message
                        msg = save_message(
                            db_s,
                            int(conversation_id),
                            int(user_id),
                            content,
                            file_url
                        )
                        return {
                            "id": msg.id,
                            "conversation_id": msg.conversation_id,
                            "sender_id": msg.sender_id,
                            "content": msg.content,
                            "file_url": msg.file_url,
                            "created_at": str(msg.created_at)
                        }
                    finally:
                        db_s.close()

                saved = await run_in_threadpool(save_msg)

                await manager.broadcast_safe(
                    conversation_id,
                    {"type": "message", "message": saved}
                )

            # ======================================================
            # TYPING
            # ======================================================
            elif payload.get("type") == "typing":
                await manager.broadcast_safe(
                    conversation_id,
                    {
                        "type": "typing",
                        "user_id": user_id,
                        "status": payload.get("status", True)
                    },
                    exclude_user=user_id
                )

            # ======================================================
            # SEEN
            # ======================================================
            elif payload.get("type") == "seen":
                message_ids = payload.get("message_ids", [])

                def save_seen():
                    db_s = next(db.get_db())
                    try:
                        from .models import MessageSeen
                        for mid in message_ids:
                            exists = (
                                db_s.query(MessageSeen)
                                .filter(MessageSeen.message_id == mid,
                                        MessageSeen.user_id == user_id)
                                .first()
                            )
                            if not exists:
                                db_s.add(MessageSeen(
                                    message_id=mid,
                                    user_id=user_id
                                ))
                        db_s.commit()
                    finally:
                        db_s.close()

                await run_in_threadpool(save_seen)

                await manager.broadcast_safe(
                    conversation_id,
                    {
                        "type": "seen",
                        "user_id": user_id,
                        "message_ids": message_ids
                    }
                )

    except WebSocketDisconnect:
        pass

    finally:
        manager.disconnect(conversation_id, user_id)
        await manager.broadcast_safe(
            conversation_id,
            {
                "type": "presence",
                "user_id": user_id,
                "status": "offline"
            }
        )


# -------------------------------------------------------------
# Swagger: add JWT bearer auth
# -------------------------------------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Chat backend (FastAPI)",
        version="0.1.0",
        description="Chat backend using JWT + WebSocket",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
