import React, { useState, useEffect } from 'react';
import { getAllUsers, createConversation } from '../../services/api';
import './NewConversationModal.css';

function NewConversationModal({ onClose, onConversationCreated }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 người');
      return;
    }

    if (isGroup && selectedUsers.length < 2) {
      alert('Nhóm chat phải có ít nhất 2 thành viên');
      return;
    }

    setLoading(true);
    try {
      await createConversation(
        isGroup ? groupName : null,
        isGroup,
        selectedUsers
      );
      onConversationCreated();
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Không thể tạo cuộc hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo cuộc hội thoại mới</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="conversation-type">
            <label>
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
              />
              Tạo nhóm chat
            </label>
          </div>

          {isGroup && (
            <div className="form-group">
              <label>Tên nhóm</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm"
              />
            </div>
          )}

          <div className="user-list">
            <h3>Chọn thành viên</h3>
            {users.map(user => (
              <div
                key={user.id}
                className={`user-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                onClick={() => handleUserToggle(user.id)}
              >
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.display_name || user.username}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                {selectedUsers.includes(user.id) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-create" 
            onClick={handleCreateConversation}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewConversationModal;
