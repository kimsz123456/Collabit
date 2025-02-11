import { ChatRoomListResponse } from "@/shared/types/response/chat";
import { createContext, useContext } from "react";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";

interface ChatListContextType {
  chatList: ChatRoomListResponse[] | undefined;
  hasNextPage: boolean | undefined;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<InfiniteQueryObserverResult>;
}

export const ChatListContext = createContext<ChatListContextType | null>(null);

export const ChatListProvider = ({
  children,
  initialData,
  hasNextPage,
  fetchNextPage,
}: {
  children: React.ReactNode;
  initialData: ChatRoomListResponse[] | undefined;
  hasNextPage: boolean | undefined;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<InfiniteQueryObserverResult>;
}) => {
  return (
    <ChatListContext.Provider
      value={{ chatList: initialData, hasNextPage, fetchNextPage }}
    >
      {children}
    </ChatListContext.Provider>
  );
};

export const useChatList = () => {
  const context = useContext(ChatListContext);
  if (!context) {
    throw new Error("useChatList must be used within a ChatListProvider");
  }
  return context;
};
