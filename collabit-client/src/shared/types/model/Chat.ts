export interface ChatRoom {
  code: number;
  userCode1: string;
  userCode2: string;
}

export interface ChatMessage {
  roomCode: number;
  userCode: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatUser {
  nickname: string;
  profileImage: string;
}

export interface WebSocketMessage {
  nickname: string;
  message: string;
  timestamp: string;
  roomCode: number;
}

