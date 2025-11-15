import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (conversation && currentUser) {
      loadMessages();
      connectWebSocket();
    }

    return () => {
      wsService.disconnect();
    };
  }, [conversation?.id]);

  const loadMessages = async () => {
    try {
      const response = await getMessages(conversation.id);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    wsService.connect(conversation.id, currentUser.id, token);
    wsService.addListener(handleWebSocketMessage);
  };

  const handleWebSocketMessage = (data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    } else if (data.type === 'typing') {
      if (data.user_id !== currentUser.id) {
        if (data.status) {
          setTyping(data.user_id);
        } else {
          setTyping(null);
        }
      }
    } else if (data.type === 'presence') {
      if (data.status === 'online') {
        setOnlineUsers(prev => new Set([...prev, data.user_id]));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user_id);
          return newSet;
        });
      }
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      wsService.sendMessage(inputMessage.trim());
      setInputMessage('');
      wsService.sendTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    wsService.sendTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await uploadFile(file);
        const fileUrl = response.data.file_url;
        wsService.sendMessage(`[File: ${file.name}]`, fileUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Không thể tải file lên');
      }
    }
  };

  const getConversationName = () => {
    if (conversation.is_group) {
      return conversation.name || 'Nhóm';
    } else {
      const otherMember = conversation.members.find(m => m.id !== currentUser.id);
      return otherMember ? otherMember.username : 'Unknown';
    }
  };

  const getSenderName = (senderId) => {
    const member = conversation.members.find(m => m.id === senderId);
    return member ? member.username : 'Unknown';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{getConversationName()}</h3>
          <p>{conversation.is_group ? `${conversation.members.length} thành viên` : 
             (onlineUsers.has(conversation.members.find(m => m.id !== currentUser.id)?.id) ? 
             'Đang hoạt động' : 'Không hoạt động')}</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_id === currentUser.id ? 'message-sent' : 'message-received'}`}
          >
            {conversation.is_group && msg.sender_id !== currentUser.id && (
              <div className="message-sender">{getSenderName(msg.sender_id)}</div>
            )}
            <div className="message-bubble">
              {msg.file_url ? (
                <div className="message-file">
                  <a href={`http://localhost:8000${msg.file_url}`} target="_blank" rel="noopener noreferrer">
                    📎 {msg.content || 'File đính kèm'}
                  </a>
                </div>
              ) : (
                <div className="message-text">{msg.content}</div>
              )}
              <div className="message-time">{formatTime(msg.created_at)}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="typing-indicator">
            <span>{getSenderName(typing)} đang nhập...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          className="btn-attach"
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm file"
        >
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
