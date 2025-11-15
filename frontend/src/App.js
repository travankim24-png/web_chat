import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DemoLogin from './components/Auth/DemoLogin';
import ChatApp from './components/Chat/ChatApp';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const demo = localStorage.getItem('demoMode');
    if (token) {
      setIsAuthenticated(true);
      setDemoMode(demo === 'true');
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, user, isDemo = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('demoMode', isDemo.toString());
    setIsAuthenticated(true);
    setDemoMode(isDemo);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    setIsAuthenticated(false);
    setDemoMode(false);
  };

  if (loading) {
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
            path="/demo" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <DemoLogin onLogin={(token, user) => handleLogin(token, user, true)} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <ChatApp onLogout={handleLogout} demoMode={demoMode} /> : 
              <Navigate to="/demo" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
