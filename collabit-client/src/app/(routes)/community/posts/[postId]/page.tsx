import CommunityDetail from "@/features/community/ui/CommunityDetail";
import { getPostAPI } from "@/shared/api/community";
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
  // const post = await getPostAPI(Number(postId));

  return (
    <div className="mx-auto w-full max-w-5xl overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CommunityDetail postId={Number(postId)} />
      </HydrationBoundary>
    </div>
  );
};

export default CommunityDetailPage;
