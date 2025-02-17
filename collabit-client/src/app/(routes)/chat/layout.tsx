"use client";

import { ChatListProvider } from "@/features/chat/context/ChatListProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useChatRoomList } from "@/features/chat/api/useChatRoomList";
import useSocket from "@/features/chat/api/useSocket";
import { useChatStore } from "@/shared/lib/stores/chatStore";
import { WebSocketMessage } from "@/shared/types/model/Chat";

const ChatLayout = ({
  list,
  room,
}: {
  list: React.ReactNode;
  room: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isChatRoom =
    (pathname.includes("/chat/") && pathname !== "/chat") ||
    (pathname.includes("/survey/") && pathname !== "/survey");

  // WebSocket 연결
  const { clientRef, connectionStatus } = useSocket();
  const { setSendMessage, addMessage, chatId } = useChatStore();

  useEffect(() => {
    if (!clientRef.current) return;

    const handleSendMessage = async (message: WebSocketMessage) => {
      if (!clientRef.current?.connected) {
        return;
      }
      if (!chatId) {
        return;
      }
      addMessage(message);

      try {
        await connectionStatus;
        clientRef.current.publish({
          destination: `/app/chat.message/${chatId}`,
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error("❌ Failed to send message:", error);
      }
    };

    setSendMessage(handleSendMessage);
  }, [clientRef, setSendMessage, connectionStatus, chatId]);

  // 리스트 렌더링
  const { chatList, hasNextPage, fetchNextPage } = useChatRoomList();

  // 디테일 렌더링
  const { setChatId } = useChatStore();

  useEffect(() => {
    const pathParts = pathname.split("/");
    const newChatId = pathParts.length > 2 ? pathParts[2] : null;

    if (newChatId && !isNaN(Number(newChatId))) {
      setChatId(Number(newChatId));
    } else {
      setChatId(null);
    }
  }, [pathname, setChatId]);

  return (
    <ChatListProvider
      initialData={chatList}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    >
      {/* 모바일 레이아웃 */}
      <div className="md:hidden">{isChatRoom ? room : list}</div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden w-full border-b border-gray-200 md:flex">
        <div className="w-1/4 min-w-[280px] border-r">{list}</div>
        <div className="w-3/4">{room}</div>
      </div>
    </ChatListProvider>
  );
};

export default ChatLayout;
