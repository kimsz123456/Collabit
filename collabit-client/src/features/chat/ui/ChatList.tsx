"use client";
import ChatListCard from "@/entities/chat/ui/ChatListCard";
import ChatNav from "@/entities/chat/ui/ChatNav";
import EmptyChatList from "@/entities/chat/ui/EmptyChatList";
import { useChatList } from "../context/ChatListProvider";
import { useEffect, useRef } from "react";

export default function ChatList() {
  const { chatList, hasNextPage, fetchNextPage } = useChatList();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col items-center gap-3 px-2 md:py-4">
      <ChatNav />

      <div className="flex h-[calc(100vh-220px)] w-full flex-col gap-2 overflow-y-auto md:h-[calc(100vh-192px)]">
        {chatList && chatList.length > 0 ? (
          chatList.map((item) => (
            <ChatListCard
              type="chat"
              key={item.roomCode}
              id={item.roomCode}
              nickname={item.nickname}
              profileImage={item.profileImage}
              title={item.nickname}
              description={item.lastMessage}
              updatedAt={item.lastMessageTime}
              unRead={item.unreadMessageCount}
            />
          ))
        ) : (
          <EmptyChatList />
        )}

        {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
      </div>
    </div>
  );
}
