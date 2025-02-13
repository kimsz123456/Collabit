import UserAvatar from "@/entities/common/ui/UserAvatar";
import CommentList from "@/entities/community/ui/CommentList";
import CommponetInput from "@/entities/community/ui/CommnetInput";
import { CommunityCardActions } from "@/entities/community/ui/CommunityCardAction";
import { PostDetailResponse } from "@/shared/types/response/post";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";

const CommunityDetail = ({ post }: { post: PostDetailResponse }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex h-full w-full flex-col gap-2 border-b border-b-border py-5">
        <div className="flex w-full items-center justify-between">
          <UserAvatar
            user={{
              nickname: post.author.nickname,
              profileImage: post.author.profileImage,
              githubId: post.author.githubId,
            }}
            time={formatRelativeTime(post.createdAt)}
          />
          {/* <CommunityCardMenu post={post} /> */}
        </div>
        <p className="px-2 py-5 text-lg">{post.content}</p>
        <CommunityCardActions post={post} />
      </div>
      <CommponetInput
        img={post.author.profileImage}
        nickname={post.author.nickname}
        postCode={post.code}
      />
      <CommentList postCode={post.code} />
    </div>
  );
};

export default CommunityDetail;
