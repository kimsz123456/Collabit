import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/api/useAuth";
import { getChatMessagesAPI, getChatRoomDetailAPI } from "@/shared/api/chat";
import { useChatStore } from "@/shared/lib/stores/chatStore";
import { WebSocketMessage } from "@/shared/types/model/Chat";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useChat = () => {
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();
  const { chatId, chatRoomDetail, setChatRoomDetail, setChatMessages } =
    useChatStore();

  // 현재 URL 저장 (Next.js useRouter 문제 방지)
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

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
  const allMessages = messages?.pages?.flatMap((page) => page.content) ?? [];

  // 새로운 메시지가 오면 query 상태를 직접 업데이트
  const updateMessages = (message: WebSocketMessage) => {
    queryClient.setQueryData(
      ["chatMessages", message.roomCode],
      (oldData: any) => {
        if (!oldData) return { pages: [{ content: [message] }] };

        return {
          ...oldData,
          pages: [
            {
              content: [message, ...oldData.pages[0].content], // 최신 메시지를 가장 앞에 추가
            },
            ...oldData.pages.slice(1),
          ],
        };
      },
    );
  };

  // 채팅방 입장 시 데이터 초기화 및 새로고침 (URL 변경 시도 반영)
  useEffect(() => {
    if (chatId && currentPath) {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", chatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chatRoom", chatId],
      });
    }
  }, [chatId, currentPath, queryClient]); // URL 변경 감지

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
    updateMessages, // 새로운 메시지를 query 상태에 반영하는 함수
  };
};
