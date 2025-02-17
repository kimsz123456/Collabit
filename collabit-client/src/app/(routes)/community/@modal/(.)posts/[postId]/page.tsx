import { getPostAPI } from "@/shared/api/community";
import ModalPostDetail from "@/widget/community/ModalPostDetail";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const CommunityDetailPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const { postId } = await params;

  if (postId == "post") {
    return null;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["postDetail", Number(postId)],
    queryFn: () => getPostAPI(Number(postId)),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ModalPostDetail postId={Number(postId)} />
    </HydrationBoundary>
  );
};

export default CommunityDetailPage;
