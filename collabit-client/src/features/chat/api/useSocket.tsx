"use client";

import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/features/auth/api/useAuth";
import { useChatRoomList } from "./useChatRoomList";
import { useChat } from "@/features/chat/api/useChat";
import { useQueryClient } from "@tanstack/react-query";
const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscribedRooms = useRef<Set<number>>(new Set()); // 구독된 방 추적용
  const { userInfo } = useAuth(); // 사용자의 채팅방 목록
  const { chatList } = useChatRoomList();
  const { addMessage } = useChat();
  const queryClient = useQueryClient();

  // WebSocket 연결 및 구독 설정
  useEffect(() => {
    if (!userInfo?.nickname || clientRef.current) return;

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URI}/ws/chat`);
    clientRef.current = new Client({
      webSocketFactory: () => socket as unknown as WebSocket,
      reconnectDelay: 5000,
      connectHeaders: { nickname: userInfo?.nickname },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공");
        setConnectionStatus("connected");
      },
      onDisconnect: () => {
        console.log("🔴 WebSocket 연결 해제");
        if (chatList) {
          chatList.forEach((room) => {
            const roomCode = room.roomCode;
            clientRef.current?.publish({
              destination: `/app/chat.disconnect/${roomCode}`,
              body: JSON.stringify({ roomCode }),
            });
          });
        }
        subscribedRooms.current.clear(); // 구독 목록 초기화
        setConnectionStatus("disconnected");
      },
    });

    clientRef.current.activate();

    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [userInfo?.nickname]);

  useEffect(() => {
    // chatList가 있고 연결된 상태일 때만 구독 처리
    if (connectionStatus === "connected" && chatList && chatList.length > 0) {
      chatList.forEach((room) => {
        if (!subscribedRooms.current.has(room.roomCode)) {
          subscribeToRoom(room.roomCode);
          subscribedRooms.current.add(room.roomCode); // 구독 목록에 추가
        }
      });
    }
  }, [connectionStatus, chatList]);

  // 채팅방 구독 함수
  const subscribeToRoom = (roomCode: number) => {
    if (!clientRef.current?.connected) {
      console.error("❌ Cannot subscribe: WebSocket not connected");
      return;
    }

    console.log(`✅ 채팅방 ${roomCode} 구독 시작`);
    clientRef.current?.subscribe(`/topic/chat/${roomCode}`, (message) => {
      const receivedMessage = JSON.parse(message.body);

      // 받은 메시지가 내가 보낸 메시지가 아닐 때만 추가
      if (receivedMessage.nickname !== userInfo?.nickname) {
        addMessage(receivedMessage);
      }

      queryClient.invalidateQueries({ queryKey: ["chatList"] });
    });
  };

  return { clientRef, connectionStatus };
};

export default useSocket;
