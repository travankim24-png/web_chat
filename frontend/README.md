# Chat Application Frontend

Ứng dụng chat realtime được xây dựng bằng React.

## Tính năng

- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Tạo cuộc hội thoại 1-1 hoặc nhóm
- ✅ Chat realtime với WebSocket
- ✅ Gửi tin nhắn văn bản
- ✅ Gửi file đính kèm
- ✅ Hiển thị trạng thái typing
- ✅ Hiển thị trạng thái online/offline
- ✅ Giao diện đẹp mắt, responsive

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Auth/           # Đăng nhập, đăng ký
│   └── Chat/           # Các component chat
├── services/
│   ├── api.js          # API calls
│   └── websocket.js    # WebSocket service
├── App.js
└── index.js
```

## Yêu cầu

- Node.js >= 14
- Backend server chạy tại `http://localhost:8000`

## Build cho production

```bash
npm run build
```

## Lưu ý

- Backend phải được khởi động trước khi chạy frontend
- WebSocket endpoint: `ws://localhost:8000/ws/{conversation_id}/{user_id}`
- API endpoint: `http://localhost:8000`
