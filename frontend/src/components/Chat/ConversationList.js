import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConversationList.css";

function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Ưu tiên: nickname > display_name > username
  const getMemberDisplayName = (member) => {
    return (
      member.nickname ||
      member.display_name ||
      member.username ||
      "Unknown"
    );
  };

  const getConversationName = (conv) => {
    // Nhóm → dùng tên nhóm
    if (conv.is_group) {
      return conv.name || "Nhóm";
    }

    // Chat 1-1 → tìm người còn lại
    const other = conv.members.find((m) => m.id !== currentUserId);
    if (!other) return "Unknown";

    return getMemberDisplayName(other);
  };

  const getConversationAvatar = (conv) => {
    if (conv.is_group) return null;

    const other = conv.members.find((m) => m.id !== currentUserId);
    if (!other) return null;

    return other.avatar_url || null;
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://192.168.233.56:8000${url}`;
  };

  const handleAvatarClick = (e, conv) => {
    e.stopPropagation();
    if (!conv.is_group) {
      const other = conv.members.find((m) => m.id !== currentUserId);
      if (other) navigate(`/profile/${other.id}`);
    }
  };

  // ===============================
  // 🔍 SEARCH FILTER (không ảnh hưởng logic cũ)
  // ===============================
  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="conversation-list">

      {/* Search box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredConversations.length === 0 ? (
        <div className="no-conversations">
          <p>Không tìm thấy cuộc trò chuyện nào</p>
        </div>
      ) : (
        filteredConversations.map((conv) => {
          const avatarUrl = getConversationAvatar(conv);

          return (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedConversation?.id === conv.id ? "active" : ""
              }`}
              onClick={() => onSelectConversation(conv)}
            >
              <div
                className="conversation-avatar"
                onClick={(e) => handleAvatarClick(e, conv)}
                style={{ cursor: conv.is_group ? "default" : "pointer" }}
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
                <div className="conversation-name">
                  {getConversationName(conv)}
                </div>
                <div className="conversation-members">
                  {conv.is_group
                    ? `${conv.members.length} thành viên`
                    : "Trò chuyện riêng"}
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
