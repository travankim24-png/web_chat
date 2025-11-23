class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }

  connect(conversationId, userId, token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://127.0.0.1:8000/ws/${conversationId}/${userId}?token=${token}`;
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

  sendMessage(content, file_url = null) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "message", content, file_url }));
    }
  }

  sendTyping(status) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "typing", status }));
    }
  }

  sendSeen(messageIds) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
            type: "seen",
            message_ids: messageIds
        }));
    }
}

}

const wsService = new WebSocketService();
export default wsService;
