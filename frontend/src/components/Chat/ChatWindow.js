import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMessages, uploadFile } from '../../services/api';
import wsService from '../../services/websocket';
import './ChatWindow.css';

function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // -----------------------------
  // Load messages from backend
  // -----------------------------
  const loadMessages = useCallback(async () => {
    if (!conversation?.id) return;
    try {
      const res = await getMessages(conversation.id);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, [conversation?.id]);
  useEffect(() => {
    if (messages.length === 0) return;
  
    const unseen = messages.filter(
      msg => msg.sender_id !== currentUser.id &&
             (!msg.seen_by || !msg.seen_by.some(s => s.user_id === currentUser.id))
    );
  
    if (unseen.length > 0) {
      const ids = unseen.map(m => m.id);
      wsService.sendSeen(ids);
    }
  }, [messages]);
  
  // -----------------------------
  // WebSocket listener
  // -----------------------------
  const handleWebSocketMessage = useCallback(
    (data) => {
      if (data.type === 'online_list') {
        setOnlineUsers(new Set(data.users));
      }
      
      if (data.type === "message") {
        setMessages(prev => [
          ...prev,
          { ...data.message, seen_by: [] }   // luôn có seen_by
        ]);
      }
      

      else if (data.type === "seen") {
        setMessages(prev =>
            prev.map(m =>
                data.message_ids.includes(m.id)
                    ? {
                        ...m,
                        seen_by: [
                            ...(m.seen_by || []),
                            { user_id: data.user_id, seen_at: new Date().toISOString() }
                        ]
                      }
                    : m
            )
        );
    }
    

      else if (data.type === "typing") {
        if (data.user_id !== currentUser.id) {
          setTyping(data.status ? data.user_id : null);
        }
      }

      else if (data.type === "presence") {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (data.status === "online") newSet.add(data.user_id);
          else newSet.delete(data.user_id);
          return newSet;
        });
      }
    },
    [currentUser.id]
  );

  // -----------------------------
  // WebSocket connect/disconnect
  // -----------------------------
  useEffect(() => {
    if (!conversation || !currentUser) return;

    loadMessages();

    const token = localStorage.getItem("token");
    wsService.connect(conversation.id, currentUser.id, token);

    wsService.addListener(handleWebSocketMessage);

    return () => {
      wsService.removeListener(handleWebSocketMessage);
      wsService.disconnect();
    };
  }, [conversation?.id, currentUser?.id, loadMessages, handleWebSocketMessage]);

  // -----------------------------
  // Scroll to bottom
  // -----------------------------
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  // -----------------------------
  // Send message
  // -----------------------------
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    wsService.sendMessage(inputMessage.trim());
    setInputMessage('');
    wsService.sendTyping(false);
  };

  // -----------------------------
  // Input typing
  // -----------------------------
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    wsService.sendTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTyping(false);
    }, 1000);
  };

  // -----------------------------
  // Enter to send
  // -----------------------------
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // -----------------------------
  // Upload file
  // -----------------------------
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile(file);
      const fileUrl = response.data.file_url;

      wsService.sendMessage(`[File: ${file.name}]`, fileUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Không thể tải file lên");
    }
  };

  // -----------------------------
  // Helpers for UI
  // -----------------------------
  const getConversationName = () => {
    if (conversation.is_group) return conversation.name || "Nhóm";
    const other = conversation.members.find(m => m.id !== currentUser.id);
    return other?.username || "Unknown";
  };

  const getSenderName = (id) => {
    const m = conversation.members.find(m => m.id === id);
    return m?.username || "Unknown";
  };

  const formatTime = (time) => {
    const d = new Date(time);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };
  const renderSeenStatus = (msg) => {
    if (msg.sender_id !== currentUser.id) return null;
    if (!msg.seen_by || msg.seen_by.length === 0) return <span className="msg-status">✔ Đã gửi</span>;
  
    return (
      <span className="msg-status">
        ✔✔ Đã xem bởi {msg.seen_by.length} người
      </span>
    );
  };
  // -----------------------------
  // UI
  // -----------------------------
  const other = conversation.members.find(m => m.id !== currentUser.id);
  const isOnline = other && onlineUsers.has(other.id);
  return (
    

    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{getConversationName()}</h3>
          <p>
            {conversation.is_group
              ? `${conversation.members.length} thành viên`
              : isOnline
               ? "Đang hoạt động"
               : "Không hoạt động"}
          </p>

        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_id === currentUser.id ? "message-sent" : "message-received"}`}
          >
            {conversation.is_group && msg.sender_id !== currentUser.id && (
              <div className="message-sender">{getSenderName(msg.sender_id)}</div>
            )}

            <div className="message-bubble">
              {msg.file_url ? (
                <a href={`http://127.0.0.1:8000${msg.file_url}`} target="_blank" rel="noopener noreferrer">
                  📎 {msg.content || "File đính kèm"}
                </a>
              ) : (
                <div className="message-text">{msg.content}</div>
              )}
              <div className="message-time">{formatTime(msg.created_at)}</div>
              {renderSeenStatus(msg)}
            </div>
          </div>
        ))}

        {typing && (
          <div className="typing-indicator">
            {getSenderName(typing)} đang nhập...
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="chat-input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button className="btn-attach" onClick={() => fileInputRef.current?.click()}>
          📎
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />

        <button className="btn-send" onClick={handleSendMessage}>
          Gửi
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
