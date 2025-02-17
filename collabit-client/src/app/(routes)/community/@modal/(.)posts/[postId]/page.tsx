import { getPostAPI } from "@/shared/api/community";
import ModalPostDetail from "@/widget/community/ModalPostDetail";

const CommunityDetailPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const { postId } = await params;
  if (postId == "post") {
    return null;
  }
  const post = await getPostAPI(Number(postId));
  return <ModalPostDetail post={post} />;
};

export default CommunityDetailPage;
