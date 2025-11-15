import React from 'react';
import './ConversationList.css';

function ConversationList({ conversations, selectedConversation, onSelectConversation, currentUserId }) {
  const getConversationName = (conv) => {
    if (conv.is_group) {
      return conv.name || 'Nhóm';
    } else {
      const otherMember = conv.members.find(m => m.id !== currentUserId);
      return otherMember ? otherMember.username : 'Unknown';
    }
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>Chưa có cuộc hội thoại nào</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="conversation-avatar">
              {getConversationName(conv)[0].toUpperCase()}
            </div>
            <div className="conversation-info">
              <div className="conversation-name">{getConversationName(conv)}</div>
              <div className="conversation-members">
                {conv.is_group ? `${conv.members.length} thành viên` : 'Trò chuyện riêng'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ConversationList;
