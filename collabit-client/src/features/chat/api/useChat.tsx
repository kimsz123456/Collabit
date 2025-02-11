import { useAuth } from "@/features/auth/api/useAuth";
import { getChatMessagesAPI, getChatRoomDetailAPI } from "@/shared/api/chat";
import { useChatStore } from "@/shared/lib/stores/chatStore";
import { WebSocketMessage } from "@/shared/types/model/Chat";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

export const useChat = () => {
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();
  const {
    chatId,
    chatRoomDetail,
    setChatRoomDetail,
    chatMessages,
    addMessage: originalAddMessage,
    setChatMessages,
  } = useChatStore();

  // 채팅방 디테일 쿼리
  const {
    data: chatRoom,
    isLoading: chatRoomLoading,
    error: chatRoomError,
  } = useQuery({
    queryKey: ["chatRoom", chatId],
    queryFn: () => getChatRoomDetailAPI(chatId!),
    enabled: !!userInfo?.nickname && !!chatId,
  });

  // 채팅 메시지 쿼리
  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getChatMessagesAPI(chatId!, pageParam);
      if (!response || response.content.length === 0) {
        return { content: [], hasNext: false, pageNumber: pageParam };
      }
      return response;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.pageNumber + 1 : null,
    initialPageParam: 0,
    enabled: !!userInfo?.nickname && !!chatId,
  });

  // 채팅방 디테일 저장
  useEffect(() => {
    if (chatRoom && chatRoomDetail !== chatRoom) {
      setChatRoomDetail(chatRoom);
      setChatMessages(chatRoom.messages);
    }
  }, [chatRoom, setChatRoomDetail, chatRoomDetail]);

  // 쿼리로 받아온 메시지와 store의 실시간 메시지를 합침
  const allMessages = [
    ...(chatMessages ?? []),
    ...(messages?.pages?.flatMap((page) => page.content) ?? []),
  ];


  // addMessage를 래핑하여 store에만 추가
  const addMessage = (message: WebSocketMessage) => {
    originalAddMessage(message);
  };

  // 채팅방 입장 시 데이터 초기화 및 새로고침
  useEffect(() => {
    if (chatId) {
      // 채팅방이 변경될 때 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", chatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chatRoom", chatId],
      });
    }
  }, [chatId, queryClient]);

  return {
    data: messages,
    messages: allMessages,
    chatRoomLoading,
    chatRoomError,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    addMessage,

  };
};
