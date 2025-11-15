class WebSocketService {
  constructor() {
    this.ws = null;
    this.conversationId = null;
    this.userId = null;
    this.listeners = [];
  }

  connect(conversationId, userId, token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    this.userId = userId;

    const wsUrl = `ws://localhost:8000/ws/${conversationId}/${userId}?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content, file_url = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content,
        file_url,
      }));
    }
  }

  sendTyping(status) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        status,
      }));
    }
  }

  sendSeen(messageIds) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'seen',
        message_ids: messageIds,
      }));
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }
}

const wsService = new WebSocketService();
export default wsService;
