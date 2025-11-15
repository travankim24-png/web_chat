import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCurrentUser, mockToken } from '../../mockData';
import './Auth.css';

function DemoLogin({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState('alice');
  const navigate = useNavigate();

  const demoUsers = [
    { username: 'alice', name: 'Alice (Bạn)' },
    { username: 'bob', name: 'Bob' },
    { username: 'charlie', name: 'Charlie' },
  ];

  const handleDemoLogin = (e) => {
    e.preventDefault();
    
    // Simulate login with mock data
    const user = {
      id: selectedUser === 'alice' ? 1 : selectedUser === 'bob' ? 2 : 3,
      username: selectedUser,
    };
    
    onLogin(mockToken, user);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🎨 Demo Mode</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Test giao diện không cần backend
        </p>
        
        <form onSubmit={handleDemoLogin}>
          <div className="form-group">
            <label>Chọn tài khoản demo</label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              {demoUsers.map(user => (
                <option key={user.username} value={user.username}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="btn-primary">
            Vào Demo
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '5px',
          fontSize: '13px',
          color: '#555',
        }}>
          <strong>📝 Lưu ý:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Sử dụng dữ liệu giả để test giao diện</li>
            <li>Không cần chạy backend</li>
            <li>Tin nhắn mới sẽ chỉ lưu trên bộ nhớ tạm</li>
            <li>Refresh trang sẽ mất dữ liệu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DemoLogin;
