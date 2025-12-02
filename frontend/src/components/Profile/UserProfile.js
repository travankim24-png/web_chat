import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import './Profile.css';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      alert('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://192.168.233.56:8000${url}`;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Đang tải...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Không tìm thấy người dùng</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Quay lại
        </button>
        <h2>Hồ sơ người dùng</h2>
        <div></div>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {profile.avatar_url ? (
              <img src={getAvatarUrl(profile.avatar_url)} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        <div className="profile-info-section">
          <div className="info-row">
            <label>Tên đăng nhập</label>
            <div className="info-value">{profile.username}</div>
          </div>

          <div className="info-row">
            <label>Email</label>
            <div className="info-value">{profile.email}</div>
          </div>

          <div className="info-row">
            <label>Tên hiển thị</label>
            <div className="info-value">
              {profile.display_name || <span className="text-muted">Chưa cập nhật</span>}
            </div>
          </div>

          <div className="info-row">
            <label>Giới thiệu</label>
            <div className="info-value">
              {profile.bio || <span className="text-muted">Chưa cập nhật</span>}
            </div>
          </div>

          <div className="info-row">
            <label>Số điện thoại</label>
            <div className="info-value">
              {profile.phone || <span className="text-muted">Chưa cập nhật</span>}
            </div>
          </div>

          <div className="info-row">
            <label>Địa chỉ</label>
            <div className="info-value">
              {profile.address || <span className="text-muted">Chưa cập nhật</span>}
            </div>
          </div>

          <div className="info-row">
            <label>Ngày sinh</label>
            <div className="info-value">
              {profile.birthday || <span className="text-muted">Chưa cập nhật</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
