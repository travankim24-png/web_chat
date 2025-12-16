import React, { useState, useEffect } from 'react';
import { updateNickname, changeTheme, getMedia } from '../../services/api';
import { getApiBase } from "../../config";   // ✔ THÊM DÒNG NÀY
import './ChatSettings.css';

function ChatSettings({ conversation, currentUser, onClose, onChangeTheme }) {
  const [activeTab, setActiveTab] = useState('customize');
  const [nickname, setNickname] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [groupNicknames, setGroupNicknames] = useState({});
  const [mediaImages, setMediaImages] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  // THEMES
  const themes = [
    { id: 'default', name: 'Mặc định', gradient: 'linear-gradient(45deg, #f09433, #bc1888)' },
    { id: 'ocean', name: 'Đại dương', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { id: 'sunset', name: 'Hoàng hôn', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { id: 'forest', name: 'Rừng xanh', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { id: 'galaxy', name: 'Thiên hà', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { id: 'fire', name: 'Lửa', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  ];

  useEffect(() => {
    if (conversation?.theme) {
      setSelectedTheme(conversation.theme);
    } else {
      setSelectedTheme("default");
    }
  }, [conversation]);

  // SAVE NICKNAME 1-1
  const handleSaveNickname = async () => {
    if (!nickname.trim()) return;

    try {
      await updateNickname(conversation.id, currentUser.id, nickname);
      alert("Đã cập nhật biệt danh!");
      setNickname("");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật biệt danh");
    }
  };

  // NICKNAME GROUP
  const handleGroupNicknameChange = (userId, value) => {
    setGroupNicknames(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSaveGroupNickname = async (userId, username) => {
    const nicknameValue = groupNicknames[userId];
    if (!nicknameValue?.trim()) return;

    try {
      await updateNickname(conversation.id, userId, nicknameValue);
      alert(`Đã lưu biệt danh "${nicknameValue}" cho ${username}!`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu biệt danh!");
    }
  };

  // CHANGE THEME
  const handleSelectTheme = async (themeId) => {
    setSelectedTheme(themeId);

    try {
      await changeTheme(conversation.id, themeId);

      if (typeof onChangeTheme === "function") {
        onChangeTheme(themeId);
      }

      alert("Đã đổi màu tin nhắn!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đổi theme");
    }
  };

  // LOAD MEDIA
  useEffect(() => {
    if (activeTab === "media") {
      loadMedia();
    }
  }, [activeTab]);

  const loadMedia = async () => {
    try {
      const res = await getMedia(conversation.id);
      setMediaImages(res.data.images);
      setMediaFiles(res.data.files);
    } catch (err) {
      console.error(err);
    }
  };

  // DARK MODE
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

  const otherMember = conversation.members.find(
    (m) => m.id !== currentUser.id
  );

  // -----------------------------
  // Hàm build URL động từ backend
  // -----------------------------
  const buildUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
  
    const apiBase = getApiBase();   // 🔥 lấy runtime value
    return `${apiBase}${url}`;
  };
  

  return (
    <div className="chat-settings-overlay" onClick={onClose}>
      <div className="chat-settings-panel" onClick={(e) => e.stopPropagation()}>

        <div className="chat-settings-header">
          <h2>Tùy chỉnh đoạn chat</h2>
          <button className="btn-close-settings" onClick={onClose}>×</button>
        </div>

        {/* TABS */}
        <div className="chat-settings-tabs">
          <button className={`tab-btn ${activeTab === 'customize' ? 'active' : ''}`} onClick={() => setActiveTab('customize')}>
            Tùy chỉnh
          </button>

          <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            Ảnh & File
          </button>

          <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            Tìm kiếm
          </button>
        </div>

        {/* CONTENT */}
        <div className="chat-settings-content">

          {/* CUSTOMIZE TAB */}
          {activeTab === 'customize' && (
            <div className="customize-section">

              {/* NICKNAME */}
              <div className="setting-group">
                <h3>Biệt danh</h3>

                {conversation.is_group ? (
                  <div className="nickname-list">
                    {conversation.members.map(member => (
                      <div key={member.id} className="nickname-item">

                        <div className="nickname-member-info">
                          <div className="nickname-avatar">
                            {member.avatar_url ? (
                              <img
                                src={buildUrl(member.avatar_url)}
                                alt=""
                              />
                            ) : (
                              <div className="avatar-placeholder-tiny">
                                {member.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          <span className="nickname-username">{member.username}</span>
                          {member.id === currentUser.id && (
                            <span className="badge-you">Bạn</span>
                          )}
                        </div>

                        <div className="nickname-input-group-inline">
                          <input
                            type="text"
                            placeholder="Nhập biệt danh..."
                            className="nickname-input-inline"
                            value={groupNicknames[member.id] || ''}
                            onChange={(e) =>
                              handleGroupNicknameChange(member.id, e.target.value)
                            }
                          />

                          <button
                            className="btn-save-nickname-small"
                            onClick={() =>
                              handleSaveGroupNickname(member.id, member.username)
                            }
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
                      placeholder={`Nhập biệt danh cho ${otherMember?.username || "người này"}`}
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

              {/* DARK MODE */}
              <div className="setting-group">
                <h3>Chủ đề</h3>

                <div className="dark-mode-toggle">
                  <span>Chế độ tối</span>
                  <label className="switch">
                    <input type="checkbox" checked={isDarkMode} onChange={handleToggleDarkMode} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* THEMES */}
              <div className="setting-group">
                <h3>Màu tin nhắn</h3>

                <div className="theme-grid">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      className={`theme-item ${selectedTheme === theme.id ? 'selected' : ''}`}
                      onClick={() => handleSelectTheme(theme.id)}
                    >
                      <div className="theme-preview" style={{ background: theme.gradient }}></div>

                      <span className="theme-name">{theme.name}</span>

                      {selectedTheme === theme.id && <span className="theme-check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MEDIA TAB */}
          {activeTab === 'media' && (
            <div className="media-section">

              <h3>Ảnh & Video đã chia sẻ</h3>
              <div className="media-grid">
                {mediaImages.length === 0 ? (
                  <div className="media-placeholder">
                    <span>📷</span>
                    <p>Chưa có ảnh nào được chia sẻ</p>
                  </div>
                ) : (
                  mediaImages.map(img => (
                    <div key={img.id} className="media-item">
                      <img
                        src={buildUrl(img.url)}
                        alt=""
                        onClick={() => window.open(buildUrl(img.url))}
                      />
                    </div>
                  ))
                )}
              </div>

              <h3 style={{ marginTop: "24px" }}>File đã chia sẻ</h3>
              <div className="file-list">
                {mediaFiles.length === 0 ? (
                  <div className="file-placeholder">
                    <span>📎</span>
                    <p>Chưa có file nào được chia sẻ</p>
                  </div>
                ) : (
                  mediaFiles.map(file => (
                    <div key={file.id} className="file-item">
                      <div className="file-icon">📄</div>
                      <div className="file-info">
                        <span className="filename">{file.filename}</span>

                        <a
                          href={buildUrl(file.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-download"
                        >
                          Tải xuống
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === "search" && (
            <div className="search-section">
              <p>Coming soon...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ChatSettings;
