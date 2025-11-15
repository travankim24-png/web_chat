import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';
import { getMyConversations } from '../../services/api';
import './ChatApp.css';

function ChatApp({ onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await getMyConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  const handleNewConversation = () => {
    setShowNewConvModal(true);
  };

  const handleConversationCreated = () => {
    setShowNewConvModal(false);
    loadConversations();
  };

  return (
    <div className="chat-app">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Tin nhắn</h2>
          <div className="sidebar-actions">
            <button onClick={handleNewConversation} className="btn-new-chat" title="Tạo cuộc trò chuyện mới">
              +
            </button>
            <button onClick={onLogout} className="btn-logout" title="Đăng xuất">
              ⎋
            </button>
          </div>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUser?.id}
        />
      </div>
      <div className="chat-main">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUser={currentUser}
          />
        ) : (
          <div className="no-conversation-selected">
            <h3>Chọn một cuộc hội thoại để bắt đầu</h3>
          </div>
        )}
      </div>
      {showNewConvModal && (
        <NewConversationModal
          onClose={() => setShowNewConvModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export default ChatApp;
