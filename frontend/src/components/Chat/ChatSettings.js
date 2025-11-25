import React, { useState } from 'react';
import './ChatSettings.css';

function ChatSettings({ conversation, currentUser, onClose, onUpdateNickname, onChangeTheme }) {
  const [activeTab, setActiveTab] = useState('customize');
  const [nickname, setNickname] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [groupNicknames, setGroupNicknames] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const themes = [
    { id: 'default', name: 'Mặc định', primary: '#0095f6', gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { id: 'ocean', name: 'Đại dương', primary: '#0084ff', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'sunset', name: 'Hoàng hôn', primary: '#ff6b6b', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'forest', name: 'Rừng xanh', primary: '#00d2ff', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'galaxy', name: 'Thiên hà', primary: '#8e2de2', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'fire', name: 'Lửa', primary: '#ff6b6b', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  ];

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      onUpdateNickname(nickname);
      setNickname('');
      alert('Đã cập nhật biệt danh!');
    }
  };

  const handleGroupNicknameChange = (userId, value) => {
    setGroupNicknames(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSaveGroupNickname = (userId, username) => {
    const nicknameValue = groupNicknames[userId];
    if (nicknameValue && nicknameValue.trim()) {
      console.log(`Lưu biệt danh "${nicknameValue}" cho user ${userId}`);
      alert(`Đã lưu biệt danh "${nicknameValue}" cho ${username}!`);
      // TODO: Call API
    }
  };

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    onChangeTheme(themeId);
  };

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const otherMember = conversation.members.find(m => m.id !== currentUser.id);

  return (
    <div className="chat-settings-overlay" onClick={onClose}>
      <div className="chat-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-settings-header">
          <h2>Tùy chỉnh đoạn chat</h2>
          <button className="btn-close-settings" onClick={onClose}>×</button>
        </div>

        <div className="chat-settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'customize' ? 'active' : ''}`}
            onClick={() => setActiveTab('customize')}
          >
            Tùy chỉnh
          </button>
          <button 
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Ảnh & File
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Tìm kiếm
          </button>
        </div>

        <div className="chat-settings-content">
          {activeTab === 'customize' && (
            <div className="customize-section">
              <div className="setting-group">
                <h3>Biệt danh</h3>
                {conversation.is_group ? (
                  <div className="nickname-list">
                    {conversation.members.map(member => (
                      <div key={member.id} className="nickname-item">
                        <div className="nickname-member-info">
                          <div className="nickname-avatar">
                            {member.avatar_url ? (
                              <img src={member.avatar_url.startsWith('http') ? member.avatar_url : `http://127.0.0.1:8000${member.avatar_url}`} alt="" />
                            ) : (
                              <div className="avatar-placeholder-tiny">
                                {member.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="nickname-username">{member.username}</span>
                          {member.id === currentUser.id && <span className="badge-you">Bạn</span>}
                        </div>
                        <div className="nickname-input-group-inline">
                          <input
                            type="text"
                            placeholder="Nhập biệt danh..."
                            className="nickname-input-inline"
                            value={groupNicknames[member.id] || ''}
                            onChange={(e) => handleGroupNicknameChange(member.id, e.target.value)}
                          />
                          <button 
                            className="btn-save-nickname-small"
                            onClick={() => handleSaveGroupNickname(member.id, member.username)}
                            disabled={!groupNicknames[member.id]?.trim()}
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="nickname-input-group">
                    <input
                      type="text"
                      placeholder={`Nhập biệt danh cho ${otherMember?.username || 'người này'}`}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="nickname-input"
                    />
                    <button 
                      className="btn-save-nickname"
                      onClick={handleSaveNickname}
                      disabled={!nickname.trim()}
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>

              <div className="setting-group">
                <h3>Chủ đề</h3>
                <div className="dark-mode-toggle">
                  <span>Chế độ tối</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={isDarkMode}
                      onChange={handleToggleDarkMode}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Màu tin nhắn</h3>
                <div className="theme-grid">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      className={`theme-item ${selectedTheme === theme.id ? 'selected' : ''}`}
                      onClick={() => handleSelectTheme(theme.id)}
                    >
                      <div 
                        className="theme-preview" 
                        style={{ background: theme.gradient }}
                      ></div>
                      <span className="theme-name">{theme.name}</span>
                      {selectedTheme === theme.id && (
                        <span className="theme-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="media-section">
              <h3>Ảnh & Video đã chia sẻ</h3>
              <div className="media-grid">
                <div className="media-placeholder">
                  <span>📷</span>
                  <p>Chưa có ảnh nào được chia sẻ</p>
                </div>
              </div>
              <h3 style={{ marginTop: '24px' }}>File đã chia sẻ</h3>
              <div className="file-list">
                <div className="file-placeholder">
                  <span>📎</span>
                  <p>Chưa có file nào được chia sẻ</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Tìm kiếm tin nhắn..."
                  className="search-messages-input"
                />
                <button className="btn-search">🔍</button>
              </div>
              <div className="search-results">
                <div className="search-placeholder">
                  <span>🔍</span>
                  <p>Nhập từ khóa để tìm kiếm tin nhắn</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatSettings;
