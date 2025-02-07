import { ChatRoomListResponse } from "@/shared/types/response/chat";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export const ChatListContext = createContext<{
  chatList: ChatRoomListResponse[] | undefined;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  setChatList: Dispatch<SetStateAction<ChatRoomListResponse[] | undefined>>;
} | null>(null);

export const ChatListProvider = ({
  children,
  initialData,
  hasNextPage,
  fetchNextPage,
}: {
  children: React.ReactNode;
  initialData: ChatRoomListResponse[] | undefined;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  const [chatList, setChatList] = useState(initialData);

  useEffect(() => {
    setChatList(initialData);
  }, [initialData]);

  return (
    <ChatListContext.Provider
      value={{ chatList, setChatList, hasNextPage, fetchNextPage }}
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
