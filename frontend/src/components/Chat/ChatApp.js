import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';
import { getMyConversations } from '../../services/api';
import { mockConversations } from '../../mockData';
import './ChatApp.css';

function ChatApp({ onLogout, demoMode = false }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    loadConversations();
  }, [demoMode]);

  const loadConversations = async () => {
    if (demoMode) {
      // Use mock data in demo mode
      setConversations(mockConversations);
    } else {
      try {
        const response = await getMyConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
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
          <h2>Tin nhắn {demoMode && '🎨'}</h2>
          <div className="sidebar-actions">
            {!demoMode && (
              <button onClick={handleNewConversation} className="btn-new-chat" title="Tạo cuộc trò chuyện mới">
                +
              </button>
            )}
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
            demoMode={demoMode}
          />
        ) : (
          <div className="no-conversation-selected">
            <h3>Chọn một cuộc hội thoại để bắt đầu</h3>
            {demoMode && (
              <p style={{ color: '#999', marginTop: '10px' }}>
                Bạn đang ở chế độ Demo - dữ liệu giả
              </p>
            )}
          </div>
        )}
      </div>
      {showNewConvModal && !demoMode && (
        <NewConversationModal
          onClose={() => setShowNewConvModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export default ChatApp;
