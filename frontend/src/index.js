import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { loadBackendConfig } from './config';

async function startApp() {
  // 1️⃣ Chờ lấy IP backend
  await loadBackendConfig();
  console.log("Backend config sẵn sàng!");

  // 2️⃣ Render React App
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp();
