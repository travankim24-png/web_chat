import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, uploadFile } from '../../services/api';
import { getApiBase } from "../../config";
import './Profile.css';

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    phone: '',
    address: '',
    birthday: '',
    avatar_url: ''
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getMyProfile();
      setProfile(response.data);
      setFormData({
        display_name: response.data.display_name || '',
        bio: response.data.bio || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        birthday: response.data.birthday || '',
        avatar_url: response.data.avatar_url || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile(file);
      const avatarUrl = response.data.file_url;
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Không thể tải ảnh lên');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateMyProfile(formData);
      setProfile(response.data);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      address: profile.address || '',
      birthday: profile.birthday || '',
      avatar_url: profile.avatar_url || ''
    });
    setIsEditing(false);
  };

  const buildUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
  
    const apiBase = getApiBase();   // 🔥 lấy runtime value
    return `${apiBase}${url}`;
  }; 
  

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Quay lại
        </button>
        <h2>Hồ sơ cá nhân</h2>
        <button className="btn-logout-profile" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {formData.avatar_url ? (
              <img src={buildUrl(formData.avatar_url)} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          {isEditing && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                className="btn-change-avatar"
                onClick={() => fileInputRef.current?.click()}
              >
                Đổi ảnh đại diện
              </button>
            </>
          )}
        </div>

        <div className="profile-info-section">
          <div className="info-row">
            <label>Tên đăng nhập</label>
            <div className="info-value">{profile?.username}</div>
          </div>

          <div className="info-row">
            <label>Email</label>
            <div className="info-value">{profile?.email}</div>
          </div>

          <div className="info-row">
            <label>Tên hiển thị</label>
            {isEditing ? (
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="Nhập tên hiển thị"
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {profile?.display_name || <span className="text-muted">Chưa cập nhật</span>}
              </div>
            )}
          </div>

          <div className="info-row">
            <label>Giới thiệu</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Giới thiệu về bản thân"
                className="info-textarea"
                rows="3"
              />
            ) : (
              <div className="info-value">
                {profile?.bio || <span className="text-muted">Chưa cập nhật</span>}
              </div>
            )}
          </div>

          <div className="info-row">
            <label>Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {profile?.phone || <span className="text-muted">Chưa cập nhật</span>}
              </div>
            )}
          </div>

          <div className="info-row">
            <label>Địa chỉ</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {profile?.address || <span className="text-muted">Chưa cập nhật</span>}
              </div>
            )}
          </div>

          <div className="info-row">
            <label>Ngày sinh</label>
            {isEditing ? (
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {profile?.birthday || <span className="text-muted">Chưa cập nhật</span>}
              </div>
            )}
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
