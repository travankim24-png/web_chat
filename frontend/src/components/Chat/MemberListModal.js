import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from "../../config";
import './MemberListModal.css';

function MemberListModal({ conversation, currentUserId, onClose }) {
  const navigate = useNavigate();

  const handleViewProfile = (userId) => {
    if (userId !== currentUserId) {
      navigate(`/profile/${userId}`);
      onClose();
    }
  };
  // -----------------------------
  // URL động từ backend (fix IP cứng)
  // -----------------------------
  const buildUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
  
    const apiBase = getApiBase();   // 🔥 lấy runtime value
    return `${apiBase}${url}`;
  };  

  const getAvatarUrl = (url) => buildUrl(url);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thành viên ({conversation.members.length})</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="member-list">
            {conversation.members.map(member => (
              <div
                key={member.id}
                className="member-item"
                onClick={() => handleViewProfile(member.id)}
                style={{ cursor: member.id === currentUserId ? 'default' : 'pointer' }}
              >
                <div className="member-avatar">
                  {member.avatar_url ? (
                    <img src={getAvatarUrl(member.avatar_url)} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="member-info">
                  <div className="member-name">
                    {member.username}
                    {member.id === currentUserId && <span className="you-badge"> (Bạn)</span>}
                  </div>
                  {member.display_name && (
                    <div className="member-display-name">{member.display_name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberListModal;
