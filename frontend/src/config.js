let API_BASE = "";
let WS_BASE = "";

// Hàm load cấu hình từ backend
export async function loadBackendConfig() {
  try {
    const defaultHost = window.location.hostname;
    const guessURL = `http://${defaultHost}:8000/server-info`;

    const res = await fetch(guessURL);
    const data = await res.json();

    API_BASE = `http://${data.backend_ip}:${data.backend_port}`;
    WS_BASE = `ws://${data.backend_ip}:${data.backend_port}/ws`;

    console.log("Backend config loaded:", API_BASE, WS_BASE);
  } catch (e) {
    console.error("Không lấy được IP backend, dùng fallback.");

    API_BASE = "http://localhost:8000";
    WS_BASE = "ws://localhost:8000/ws";
  }
}

// ❗ Xuất *hàm* để lấy giá trị (các file luôn lấy giá trị mới nhất)
export function getApiBase() {
  return API_BASE;
}

export function getWsBase() {
  return WS_BASE;
}
