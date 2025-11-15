// Mock data for testing without backend

export const mockUsers = [
  { id: 1, username: 'alice', email: 'alice@example.com' },
  { id: 2, username: 'bob', email: 'bob@example.com' },
  { id: 3, username: 'charlie', email: 'charlie@example.com' },
  { id: 4, username: 'david', email: 'david@example.com' },
  { id: 5, username: 'emma', email: 'emma@example.com' },
];

export const mockConversations = [
  {
    id: 1,
    name: null,
    is_group: false,
    members: [
      { id: 1, username: 'alice' },
      { id: 2, username: 'bob' },
    ],
  },
  {
    id: 2,
    name: 'Nhóm dự án PBL4',
    is_group: true,
    members: [
      { id: 1, username: 'alice' },
      { id: 3, username: 'charlie' },
      { id: 4, username: 'david' },
    ],
  },
  {
    id: 3,
    name: null,
    is_group: false,
    members: [
      { id: 1, username: 'alice' },
      { id: 5, username: 'emma' },
    ],
  },
];

export const mockMessages = {
  1: [
    {
      id: 1,
      conversation_id: 1,
      sender_id: 2,
      content: 'Chào Alice! Bạn khỏe không?',
      file_url: null,
      created_at: '2025-11-16T10:00:00',
    },
    {
      id: 2,
      conversation_id: 1,
      sender_id: 1,
      content: 'Mình khỏe, cảm ơn bạn! Còn Bob thì sao?',
      file_url: null,
      created_at: '2025-11-16T10:01:00',
    },
    {
      id: 3,
      conversation_id: 1,
      sender_id: 2,
      content: 'Mình cũng tốt. Có gì mới không?',
      file_url: null,
      created_at: '2025-11-16T10:02:00',
    },
  ],
  2: [
    {
      id: 4,
      conversation_id: 2,
      sender_id: 3,
      content: 'Hôm nay họp nhóm lúc mấy giờ?',
      file_url: null,
      created_at: '2025-11-16T09:00:00',
    },
    {
      id: 5,
      conversation_id: 2,
      sender_id: 4,
      content: '2 giờ chiều nhé mọi người',
      file_url: null,
      created_at: '2025-11-16T09:05:00',
    },
    {
      id: 6,
      conversation_id: 2,
      sender_id: 1,
      content: 'Ok, mình sẽ tham gia',
      file_url: null,
      created_at: '2025-11-16T09:10:00',
    },
    {
      id: 7,
      conversation_id: 2,
      sender_id: 3,
      content: 'Đây là tài liệu cho buổi họp',
      file_url: '/uploads/document.pdf',
      created_at: '2025-11-16T09:15:00',
    },
  ],
  3: [
    {
      id: 8,
      conversation_id: 3,
      sender_id: 5,
      content: 'Alice ơi, giúp mình xem code này được không?',
      file_url: null,
      created_at: '2025-11-16T11:00:00',
    },
    {
      id: 9,
      conversation_id: 3,
      sender_id: 1,
      content: 'Được chứ, gửi cho mình xem',
      file_url: null,
      created_at: '2025-11-16T11:02:00',
    },
  ],
};

export const mockCurrentUser = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
};

export const mockToken = 'mock-jwt-token-for-demo';
