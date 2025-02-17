import { likePostAPI, unlikePostAPI } from "@/shared/api/community";
import { PageResponse } from "@/shared/types/response/page";
import {
  PostDetailResponse,
  PostListResponse,
} from "@/shared/types/response/post";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

interface MutationContext {
  previousPostDetail: PostDetailResponse | undefined;
  previousPosts: InfiniteData<PageResponse<PostListResponse>> | undefined;
}

const useLike = ({
  postCode,
  isLiked,
}: {
  postCode: number;
  isLiked: boolean;
}) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isLiked
      ? () => unlikePostAPI(postCode)
      : () => likePostAPI(postCode),
    onMutate: async () => {
      // 이전 쿼리 데이터 백업
      const previousPostDetail = queryClient.getQueryData([
        "postDetail",
        postCode,
      ]);
      const previousPosts = queryClient.getQueryData(["posts", "infinite"]);

      // PostDetail 업데이트
      if (previousPostDetail) {
        queryClient.setQueryData(
          ["postDetail", Number(postCode)],
          (old: PostDetailResponse) => ({
            ...old,
            isLiked: !isLiked,
            likeCount: isLiked ? old.likeCount - 1 : old.likeCount + 1,
          }),
        );
      }

      // Posts 리스트 업데이트
      queryClient.setQueryData(
        ["posts", "infinite"],
        (old: InfiniteData<PageResponse<PostListResponse>>) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: PageResponse<PostListResponse>) => ({
              ...page,
              content: page.content.map((post: PostListResponse) =>
                post.code === postCode
                  ? {
                      ...post,
                      liked: !isLiked,
                      likeCount: isLiked
                        ? post.likeCount - 1
                        : post.likeCount + 1,
                    }
                  : post,
              ),
            })),
          };
        },
      );

      return { previousPostDetail, previousPosts } as MutationContext;
    },
    onError: (err, variables, context: MutationContext | undefined) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousPostDetail) {
        queryClient.setQueryData(
          ["postDetail", postCode],
          context.previousPostDetail,
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", "infinite"], context.previousPosts);
      }
    },
    onSettled: () => {
      // detail 페이지 데이터가 있는 경우에만 해당 쿼리 무효화
      if (queryClient.getQueryData(["postDetail", Number(postCode)])) {
        queryClient.invalidateQueries({
          queryKey: ["postDetail", Number(postCode)],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
      });
    },
  });

  return { mutate };
};
export default useLike;
