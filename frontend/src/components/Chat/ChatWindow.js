import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessages, uploadFile } from '../../services/api';
import wsService from '../../services/websocket';
import MemberListModal from './MemberListModal';
import ChatSettings from './ChatSettings';
import StickerPicker from './StickerPicker';
import MessageReaction from './MessageReaction';
import './ChatWindow.css';

function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showMemberList, setShowMemberList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, currentUser?.id]);

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
  // Sticker selection
  // -----------------------------
  const handleStickerSelect = (sticker) => {
    wsService.sendMessage(sticker);
  };

  // -----------------------------
  // Message reaction
  // -----------------------------
  const handleReaction = (messageId, emoji) => {
    console.log(`React to message ${messageId} with ${emoji}`);
    // TODO: Send reaction via WebSocket
    // For now, just update local state
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          existingReaction.count = (existingReaction.count || 1) + 1;
          existingReaction.users = [...(existingReaction.users || []), currentUser.username];
        } else {
          reactions.push({
            emoji,
            count: 1,
            users: [currentUser.username]
          });
        }
        
        return { ...msg, reactions: [...reactions] };
      }
      return msg;
    }));
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

  const getSenderAvatar = (id) => {
    const m = conversation.members.find(m => m.id === id);
    return m?.avatar_url || null;
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const handleAvatarClick = (userId) => {
    if (userId !== currentUser.id) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleHeaderClick = () => {
    if (conversation.is_group) {
      setShowMemberList(true);
    } else {
      const other = conversation.members.find(m => m.id !== currentUser.id);
      if (other) {
        navigate(`/profile/${other.id}`);
      }
    }
  };

  const formatTime = (time) => {
    const d = new Date(time);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const isSticker = (text) => {
    // Check if message is a single emoji/sticker (1-4 characters, mostly emoji)
    if (!text) return false;
    const trimmed = text.trim();
    return trimmed.length <= 4 && /[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(trimmed);
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
  // Chat Settings handlers
  // -----------------------------
  const handleUpdateNickname = (nickname) => {
    console.log('Update nickname:', nickname);
    // TODO: Call API to update nickname
  };

  const handleChangeTheme = (themeId) => {
    setCurrentTheme(themeId);
    console.log('Change theme:', themeId);
    // TODO: Save theme preference
  };

  // -----------------------------
  // UI
  // -----------------------------
  const other = conversation.members.find(m => m.id !== currentUser.id);
  const isOnline = other && onlineUsers.has(other.id);
  const otherAvatar = other?.avatar_url;
  
  return (
    

    <div className="chat-window">
      <div className="chat-header" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
        <div className="chat-header-avatar">
          {otherAvatar ? (
            <img src={getAvatarUrl(otherAvatar)} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">
              {getConversationName()[0].toUpperCase()}
            </div>
          )}
        </div>
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
        <button 
          className="btn-settings" 
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}
          title="Tùy chỉnh đoạn chat"
        >
          ⚙️
        </button>
      </div>

      <div className="messages-container">
        {messages.map((msg) => {
          const senderAvatar = getSenderAvatar(msg.sender_id);
          return (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === currentUser.id ? "message-sent" : "message-received"}`}
            >
              {msg.sender_id !== currentUser.id && (
                <div 
                  className="message-avatar"
                  onClick={() => handleAvatarClick(msg.sender_id)}
                  style={{ cursor: 'pointer' }}
                >
                  {senderAvatar ? (
                    <img src={getAvatarUrl(senderAvatar)} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {getSenderName(msg.sender_id)[0].toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              
              <div className="message-content-wrapper">
                {conversation.is_group && msg.sender_id !== currentUser.id && (
                  <div className="message-sender">{getSenderName(msg.sender_id)}</div>
                )}

                <div className="message-bubble">
                  {msg.file_url ? (
                    <a href={`http://127.0.0.1:8000${msg.file_url}`} target="_blank" rel="noopener noreferrer">
                      📎 {msg.content || "File đính kèm"}
                    </a>
                  ) : isSticker(msg.content) ? (
                    <div className="message-sticker">{msg.content}</div>
                  ) : (
                    <div className="message-text">{msg.content}</div>
                  )}
                  <div className="message-time">{formatTime(msg.created_at)}</div>
                  {renderSeenStatus(msg)}

                  <MessageReaction 
                    message={msg}
                    onReact={handleReaction}
                    position={msg.sender_id === currentUser.id ? 'left' : 'right'}
                  />
                </div>
              </div>
            </div>
          );
        })}

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

        <button 
          className="btn-sticker" 
          onClick={() => setShowStickerPicker(!showStickerPicker)}
          title="Gửi sticker"
        >
          😀
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

      {showMemberList && (
        <MemberListModal
          conversation={conversation}
          currentUserId={currentUser.id}
          onClose={() => setShowMemberList(false)}
        />
      )}

      {showSettings && (
        <ChatSettings
          conversation={conversation}
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
          onUpdateNickname={handleUpdateNickname}
          onChangeTheme={handleChangeTheme}
        />
      )}

      {showStickerPicker && (
        <StickerPicker
          onSelectSticker={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}

export default ChatWindow;
