import { useAuth } from "@/features/auth/api/useAuth";
import { getChatRoomListAPI } from "@/shared/api/chat";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useChatRoomList = () => {
  const { userInfo } = useAuth();

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
    queryKey: ["chatList", userInfo?.nickname],
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
    refetchInterval: 10000, // 10초마다 자동 갱신
  });

  const chatList = data?.pages.flatMap((page) => page.content);

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
