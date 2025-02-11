"use client";

import { useAuth } from "@/features/auth/api/useAuth";
import { ChatListProvider } from "@/features/chat/context/ChatListProvider";
import { usePathname, useRouter } from "next/navigation";
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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isChatRoom =
    (pathname.includes("/chat/") && pathname !== "/chat") ||
    (pathname.includes("/survey/") && pathname !== "/survey");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // WebSocket 연결
  const { clientRef, connectionStatus } = useSocket();
  const { setSendMessage, addMessage, chatId } = useChatStore();

  useEffect(() => {
    if (!clientRef.current) return;

    const handleSendMessage = async (message: WebSocketMessage) => {
      console.log("📩 메시지 전송:", message);
      if (!clientRef.current?.connected) {
        console.error("❌ WebSocket이 연결되지 않음.");
        return;
      }
      if (!chatId) {
        console.error("❌ chatId가 설정되지 않음.");
        return;
      }
      addMessage(message);

      try {
        await connectionStatus;
        clientRef.current.publish({
          destination: `/app/chat.message/${chatId}`,
          body: JSON.stringify(message),
        });
        console.log("✅ Message sent successfully");
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
