import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConversationList.css';

function ConversationList({ conversations, selectedConversation, onSelectConversation, currentUserId }) {
  const navigate = useNavigate();

  const getConversationName = (conv) => {
    if (conv.is_group) {
      return conv.name || 'Nhóm';
    } else {
      const otherMember = conv.members.find(m => m.id !== currentUserId);
      return otherMember ? otherMember.username : 'Unknown';
    }
  };

  const getConversationAvatar = (conv) => {
    if (conv.is_group) {
      return null; // For groups, use placeholder
    }
    const otherMember = conv.members.find(m => m.id !== currentUserId);
    return otherMember?.avatar_url || null;
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const handleAvatarClick = (e, conv) => {
    e.stopPropagation();
    if (!conv.is_group) {
      const otherMember = conv.members.find(m => m.id !== currentUserId);
      if (otherMember) {
        navigate(`/profile/${otherMember.id}`);
      }
    }
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>Chưa có cuộc hội thoại nào</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const avatarUrl = getConversationAvatar(conv);
          return (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div 
                className="conversation-avatar"
                onClick={(e) => handleAvatarClick(e, conv)}
                style={{ cursor: conv.is_group ? 'default' : 'pointer' }}
              >
                {avatarUrl ? (
                  <img src={getAvatarUrl(avatarUrl)} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {getConversationName(conv)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">{getConversationName(conv)}</div>
                <div className="conversation-members">
                  {conv.is_group ? `${conv.members.length} thành viên` : 'Trò chuyện riêng'}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ConversationList;
