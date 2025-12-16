import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatApp from './components/Chat/ChatApp';
import Profile from './components/Profile/Profile';
import UserProfile from './components/Profile/UserProfile';
import { loadBackendConfig } from "./config";  // 🔥 Thêm dòng này
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false); // 🔥 Thêm state

  useEffect(() => {
    // 1. Load IP backend trước khi chạy app
    loadBackendConfig().then(() => {
      setConfigLoaded(true);
    });

    // 2. Kiểm tra token
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    // 3. Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    setLoading(false);
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  // CHỜ: backend config + theme load xong
  if (loading || !configLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <Register />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <ChatApp onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              isAuthenticated ? 
              <UserProfile /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
