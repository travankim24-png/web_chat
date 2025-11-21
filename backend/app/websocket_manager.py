# app/websocket_manager.py

import asyncio
from fastapi import WebSocket
from typing import Dict


class ConversationManager:
    """
    Quản lý WebSocket theo dạng:
    rooms = {
        conversation_id: {
            user_id: websocket
        }
    }
    """

    def __init__(self):
        # { conversation_id: { user_id: websocket } }
        self.rooms: Dict[int, Dict[int, WebSocket]] = {}
        self._lock = asyncio.Lock()

    # ------------------------------------------------------------------
    # KẾT NỐI
    # ------------------------------------------------------------------
    async def connect(self, conversation_id: int, user_id: int, websocket: WebSocket):
        async with self._lock:
            if conversation_id not in self.rooms:
                self.rooms[conversation_id] = {}

            self.rooms[conversation_id][user_id] = websocket

    # ------------------------------------------------------------------
    # NGẮT KẾT NỐI
    # ------------------------------------------------------------------
    def disconnect(self, conversation_id: int, websocket: WebSocket):
        user_id = getattr(websocket, "user_id", None)
        try:
            if conversation_id in self.rooms and user_id in self.rooms[conversation_id]:
                del self.rooms[conversation_id][user_id]

                # Nếu phòng rỗng → xoá luôn
                if not self.rooms[conversation_id]:
                    del self.rooms[conversation_id]
        except:
            pass

    # ------------------------------------------------------------------
    # LẤY DANH SÁCH USER ONLINE TRONG ROOM
    # ------------------------------------------------------------------
    def get_online_users(self, conversation_id: int):
        if conversation_id in self.rooms:
            return list(self.rooms[conversation_id].keys())
        return []

    # ------------------------------------------------------------------
    # GỬI TIN RIÊNG
    # ------------------------------------------------------------------
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except:
            pass

    # ------------------------------------------------------------------
    # BROADCAST
    # ------------------------------------------------------------------
    async def broadcast_to_conversation(self, conversation_id: int, message: dict):
        sockets = []

        async with self._lock:
            if conversation_id in self.rooms:
                sockets = list(self.rooms[conversation_id].values())

        if sockets:
            tasks = [self.send_personal_message(ws, message) for ws in sockets]
            await asyncio.gather(*tasks, return_exceptions=True)


# Singleton
manager = ConversationManager()
