# app/websocket_manager.py

import asyncio
from fastapi import WebSocket
from typing import Dict, Optional


class ConversationManager:
    """
    Lưu WebSocket theo dạng:
    rooms = {
        conversation_id: {
            user_id: websocket
        }
    }
    """

    def __init__(self):
        self.rooms: Dict[int, Dict[int, WebSocket]] = {}
        self._lock = asyncio.Lock()

    # ============================================================
    # CONNECT
    # ============================================================
    async def connect(self, conversation_id: int, user_id: int, websocket: WebSocket):
        websocket.user_id = user_id  # cần cho disconnect()
        async with self._lock:
            if conversation_id not in self.rooms:
                self.rooms[conversation_id] = {}

            self.rooms[conversation_id][user_id] = websocket

    # ============================================================
    # DISCONNECT
    # ============================================================
    def disconnect(self, conversation_id: int, user_id: Optional[int]):
        try:
            if conversation_id in self.rooms:

                if user_id in self.rooms[conversation_id]:
                    del self.rooms[conversation_id][user_id]

                # Nếu phòng không còn ai → xoá phòng
                if not self.rooms[conversation_id]:
                    del self.rooms[conversation_id]

        except Exception:
            pass

    # ============================================================
    # GET ONLINE USERS
    # ============================================================
    def get_online_users(self, conversation_id: int):
        if conversation_id in self.rooms:
            return list(self.rooms[conversation_id].keys())
        return []

    # ============================================================
    # SEND PERSONAL
    # ============================================================
    async def send_safe(self, websocket: WebSocket, message: dict):
        """
        Gửi message nhưng không để lỗi socket làm crash server.
        """
        try:
            await websocket.send_json(message)
        except:
            pass  # socket chết → bỏ qua

    # ============================================================
    # BROADCAST SAFE
    # ============================================================
    async def broadcast_safe(self, conversation_id: int, message: dict, exclude_user: int = None):
        """
        Gửi tới tất cả trong phòng nhưng bỏ socket chết.
        exclude_user: user không nhận message (thường dùng cho typing)
        """
        async with self._lock:
            if conversation_id not in self.rooms:
                return

            to_remove = []
            sockets = list(self.rooms[conversation_id].items())  # (user_id, websocket)

        tasks = []

        for uid, ws in sockets:
            if exclude_user and uid == exclude_user:
                continue

            tasks.append(self.send_safe(ws, message))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    # ============================================================
    # SEND TO ONE
    # ============================================================
    async def send_to_user(self, conversation_id: int, user_id: int, message: dict):
        async with self._lock:
            ws = self.rooms.get(conversation_id, {}).get(user_id)

        if ws:
            await self.send_safe(ws, message)


# Singleton
manager = ConversationManager()
