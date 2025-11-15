# app/websocket_manager.py
import asyncio
from typing import Dict, Set
from fastapi import WebSocket

class ConversationManager:
    """
    Quản lý các kết nối WebSocket theo conversation_id.
    - rooms: map conversation_id -> set(WebSocket)
    """

    def __init__(self):
        self.rooms: Dict[int, Set[WebSocket]] = {}
        # lock tránh race condition khi multi-threads
        self._lock = asyncio.Lock()

    async def connect(self, conversation_id: int, websocket: WebSocket):
        """Chấp nhận kết nối (websocket.accept) và add vào room."""
        await websocket.accept()
        async with self._lock:
            if conversation_id not in self.rooms:
                self.rooms[conversation_id] = set()
            self.rooms[conversation_id].add(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        """Remove websocket khỏi room (synchronous)."""
        try:
            if conversation_id in self.rooms:
                self.rooms[conversation_id].discard(websocket)
                # nếu room rỗng thì hủy nó
                if not self.rooms[conversation_id]:
                    del self.rooms[conversation_id]
        except Exception:
            # bảo đảm không raise khi đóng kết nối
            pass

    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Gửi message cho 1 websocket."""
        try:
            await websocket.send_json(message)
        except Exception:
            # nếu gửi fail, ignore
            pass

    async def broadcast_to_conversation(self, conversation_id: int, message: dict):
        """Gửi message tới tất cả websocket trong conversation."""
        # snapshot để tránh thay đổi set khi iterating
        sockets = []
        async with self._lock:
            if conversation_id in self.rooms:
                sockets = list(self.rooms[conversation_id])

        # gửi không chặn nhau
        coros = []
        for ws in sockets:
            coros.append(self.send_personal_message(ws, message))

        if coros:
            await asyncio.gather(*coros, return_exceptions=True)


# export a singleton manager để dùng toàn app
manager = ConversationManager()
