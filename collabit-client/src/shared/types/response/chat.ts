import { ChatMessageRequest } from "../request/chat";

export interface ChatUser {
  nickname: string;
  profileImage: string;
}

export interface ChatMessageResponse extends ChatMessageRequest {
  nickname: string;
}

export interface ChatRoomListResponse extends ChatUser {
  roomCode: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadMessageCount: number;
}

export type ChatRoomDetailResponse = ChatUser;

export type ChatRoomResponse = { roomCode: number };

export type ChatUnreadResponse = { isExist: boolean };
