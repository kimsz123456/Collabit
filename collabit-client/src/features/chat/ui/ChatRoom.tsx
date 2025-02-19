"use client";
import ChatBubble from "@/entities/chat/ui/ChatBubble";
import ChatHeader from "@/entities/chat/ui/ChatHeader";
import ChatInput from "@/entities/chat/ui/ChatInput";
import { useState, useRef, useEffect } from "react";
import { useChat } from "../api/useChat";
import { useAuth } from "@/features/auth/api/useAuth";
import { WebSocketMessage } from "@/shared/types/model/Chat";
import { ChatMessageResponse } from "@/shared/types/response/chat";
import { useChatStore } from "@/shared/lib/stores/chatStore";

// 날짜 포맷팅 함수 추가
const formatDate = (date: Date) => {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 시간 포맷팅 함수 추가
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const { userInfo } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { sendMessage } = useChatStore();
  const { chatId, chatRoomDetail, resetUnreadMessages } = useChatStore();
  const { messages } = useChat();
  const {
    chatRoomLoading,
    chatRoomError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChat();

  useEffect(() => {
    if (chatId) {
      resetUnreadMessages(chatId);
    }
  }, [chatId, resetUnreadMessages]);

  // 메시지를 날짜별로 그룹화하는 함수
  const groupMessagesByDate = (messages: ChatMessageResponse[]) => {
    const groups: { [key: string]: ChatMessageResponse[] } = {};

    // 메시지를 timestamp 기준으로 내림차순 정렬 (최신 메시지가 나중에 오도록)
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    sortedMessages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateKey = formatDate(date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  // 메시지 전송 핸들러
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (!userInfo || !sendMessage || !chatRoomDetail) {
      return;
    }

    const newMessage: WebSocketMessage = {
      nickname: userInfo.nickname,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      roomCode: chatId!,
    };
    sendMessage(newMessage);
    setMessage("");
  };

  // 채팅방 정보가 없을 경우 로딩 상태 표시
  if (chatRoomLoading) {
    return null;
  }

  if (chatRoomError || !chatRoomDetail) {
    return (
      <div className="flex h-screen items-center justify-center">
        ❌ 채팅방 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col gap-3 py-4 md:h-[calc(100vh-108px)] md:px-2">
      <ChatHeader
        nickname={chatRoomDetail.nickname}
        profileImage={chatRoomDetail.profileImage}
      />
      <div
        ref={scrollRef}
        className="flex w-full flex-1 flex-col-reverse gap-2 overflow-y-auto rounded-lg bg-white px-2 py-3 md:px-4"
        onScroll={(e) => {
          if (
            e.currentTarget.scrollTop <= 50 &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        }}
      >
        {Object.entries(groupMessagesByDate(messages))
          .reverse()
          .map(([date, messages]) => (
            <div key={date} className="flex flex-col gap-2">
              <div className="flex justify-center">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {date}
                </span>
              </div>
              {messages.map((chat, index) => (
                <ChatBubble
                  key={index}
                  isMe={chat.nickname === userInfo?.nickname}
                  message={chat.message}
                  date={formatTime(new Date(chat.timestamp))}
                  userInfo={{
                    name: chat.nickname,
                    profileImage: chatRoomDetail.profileImage,
                  }}
                />
              ))}
            </div>
          ))}
      </div>
      <ChatInput
        message={message}
        setInputMessage={setMessage}
        handleSendMessage={handleSendMessage}
        disabled={chatRoomLoading}
      />
    </div>
  );
};

export default ChatRoom;
