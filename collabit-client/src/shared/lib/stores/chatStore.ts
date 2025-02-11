import {
  ChatMessageResponse,
  ChatRoomDetailResponse,
} from "@/shared/types/response/chat";
import { WebSocketMessage } from "@/shared/types/model/Chat";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ChatState {
  chatId: number | null;
  chatRoomDetail: ChatRoomDetailResponse | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  chatMessages: ChatMessageResponse[];
  unreadMessages: { [key: number]: number };
}

interface ChatActions {
  setChatId: (chatId: number | null) => void;
  setChatRoomDetail: (chatRoomDetail: ChatRoomDetailResponse) => void;
  setSendMessage: (
    sendMessage: ((message: WebSocketMessage) => void) | null,
  ) => void;
  setChatMessages: (messages: ChatMessageResponse[]) => void;
  addMessage: (message: WebSocketMessage) => void;
  resetUnreadMessages: (chatId: number) => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  devtools((set) => ({
    chatId: null,
    chatRoomDetail: null,
    sendMessage: null,
    chatMessages: [],
    unreadMessages: {},
    setChatId: (chatId) => set({ chatId }),
    setChatRoomDetail: (chatRoomDetail) => set({ chatRoomDetail }),
    setSendMessage: (sendMessage) => set({ sendMessage }),
    setChatMessages: (messages) => set({ chatMessages: messages }),
    addMessage: (message) =>
      set((state) => {
        if (state.chatId === message.roomCode) {
          return {
            chatMessages: Array.isArray(state.chatMessages)
              ? [...state.chatMessages, message]
              : [message],
          };
        }
        return {
          unreadMessages: {
            ...state.unreadMessages,
            [message.roomCode]:
              (state.unreadMessages[message.roomCode] || 0) + 1,
          },
        };
      }),
    resetUnreadMessages: (chatId) =>
      set((state) => ({
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: 0,
        },
      })),
  })),
);
