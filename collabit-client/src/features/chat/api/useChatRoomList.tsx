import { useEffect } from "react";
import { useAuth } from "@/features/auth/api/useAuth";
import { getChatRoomListAPI } from "@/shared/api/chat";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNotificationStore } from "@/shared/lib/stores/NotificationStore";
import { useShallow } from "zustand/shallow";

export const useChatRoomList = () => {
  const { userInfo } = useAuth();
  const { chatRequests } = useNotificationStore(
    useShallow((state) => ({
      chatRequests: state.chatRequests,
    })),
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["chatList"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getChatRoomListAPI(pageParam);
      if (!response || response.content.length === 0) {
        return { content: [], hasNext: false, pageNumber: pageParam };
      }
      return response;
    },
    getNextPageParam: (lastPage) =>
      !lastPage.hasNext ? undefined : lastPage.pageNumber + 1,
    initialPageParam: 0,
    enabled: !!userInfo?.nickname,
  });

  const chatList = data?.pages.flatMap((page) => page.content);

  useEffect(() => {
    if (chatRequests.length > 0) {
      refetch();
    }
  }, [chatRequests, refetch]);

  return {
    chatList,
    error,
    status,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
};
