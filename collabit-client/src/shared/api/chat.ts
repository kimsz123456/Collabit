import { ChatroomRequest } from "../types/request/chat";
import { ChatRoomListResponse } from "../types/response/chat";
import { PageResponse } from "../types/response/page";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export const getOrCreateChatRoomAPI = async (body: ChatroomRequest) => {
  const response = await fetch(`${apiUrl}/chat/rooms`, {
    method: "POST",
    ...fetchOptions,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("채팅방 생성 실패");
  }
  return response.json();
};

export const getChatRoomListAPI = async (
  pageNumber: number,
): Promise<PageResponse<ChatRoomListResponse>> => {
  const response = await fetch(
    `${apiUrl}/chat/rooms?pageNumber=${pageNumber}`,
    {
      method: "GET",
      ...fetchOptions,
    },
  );
  if (!response.ok) {
    throw new Error("채팅방 리스트 조회 실패");
  }
  return response.json();
};

export const getChatRoomDetailAPI = async (roomCode: number) => {
  const response = await fetch(`${apiUrl}/chat/rooms/${roomCode}`, {
    method: "GET",
    ...fetchOptions,
  });

  if (!response.ok) {
    throw new Error("채팅방 조회 실패");
  }
  return response.json();
};

export const getChatMessagesAPI = async (
  roomCode: number,
  pageNumber: number,
) => {
  const response = await fetch(
    `${apiUrl}/chat/rooms/${roomCode}/messages?pageNumber=${pageNumber}`,
    {
      method: "GET",
      ...fetchOptions,
    },
  );
  if (!response.ok) {
    throw new Error("채팅 메시지 조회 실패");
  }
  return response.json();
};

export const getUnreadMessagesAPI = async () => {
  const response = await fetch(`${apiUrl}/chat/messages/unread`, {
    method: "GET",
    ...fetchOptions,
  });
  if (!response.ok) {
    throw new Error("안읽은 메시지 조회 실패");
  }
  return response.json();
};

export const getChatRoomWithNicknameAPI = async (nickname: string) => {
  const response = await fetch(
    `${apiUrl}/chat/rooms/search?nickname=${nickname}`,
    {
      method: "GET",
      ...fetchOptions,
    },
  );
  if (!response.ok) {
    throw new Error("채팅방 닉네임 조회 실패");
  }
  return response.json();
};

export const markMessageAsReadAPI = async (roomCode: number) => {
  const response = await fetch(
    `${apiUrl}/chat/rooms/${roomCode}/messages/read`,
    {
      method: "GET",
      ...fetchOptions,
    },
  );
  if (!response.ok) {
    throw new Error("메시지 읽음 처리 실패");
  }
};
