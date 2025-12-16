import { getWsBase } from "../config";   // ✅ đúng

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }

  connect(conversationId, userId, token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsBase = getWsBase();   // 🔥 luôn lấy giá trị mới nhất
    const wsUrl = `${wsBase}/${conversationId}/${userId}?token=${token}`;

    console.log("Connecting WebSocket:", wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => console.log("WebSocket connected");

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(cb => cb(data));
    };

    this.ws.onerror = (err) => console.error("WebSocket error:", err);

    this.ws.onclose = () => console.log("WebSocket disconnected");
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addListener(cb) {
    this.listeners.push(cb);
  }

  removeListener(cb) {
    this.listeners = this.listeners.filter(x => x !== cb);
  }

  sendMessage(content, file_url = null, reply_to = null) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "message",
        content,
        file_url,
        reply_to
      }));
    }
  }

  sendTyping(status) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "typing", status }));
    }
  }

  sendSeen(messageIds) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "seen",
        message_ids: messageIds
      }));
    }
  }
  
  sendReaction(messageId, emoji) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "reaction",
        message_id: messageId,
        emoji
      }));
      }
  }

}

const wsService = new WebSocketService();
export default wsService;
