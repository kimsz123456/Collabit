import { getPostAPI } from "@/shared/api/community";
import ModalPostDetail from "@/widget/community/ModalPostDetail";

const CommunityDetailPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const { postId } = await params;
  const post = await getPostAPI(Number(postId));
  console.log(post);
  return <ModalPostDetail post={post} />;
};

export default CommunityDetailPage;
