import UserAvatar from "@/entities/common/ui/UserAvatar";
import { PostListResponse } from "@/shared/types/response/post";
import { Card } from "@/shared/ui/card";
import { Heart } from "lucide-react";

const MainCommunityCard = ({ data }: { data: PostListResponse }) => {
  return (
    <Card className="no-wrap flex h-full cursor-pointer flex-col justify-between gap-4 overflow-hidden px-4 py-6 drop-shadow-lg">
      <UserAvatar size="sm" user={data.author} />
      <p className="truncate text-sm">{data.content}</p>
      <div className="flex items-center gap-1 text-xs">
        <div className="flex items-center text-gray-500">
          <span>{data.commentCount}</span>
          <span>개의 답글</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Heart
            className={` ${data.liked ? "fill-red-500 text-red-500" : ""}`}
            style={{ width: "16px", height: "16px" }}
            onClick={() => {}}
          />

          <span>{data.likeCount}</span>
        </div>
      </div>
    </Card>
  );
};

export default MainCommunityCard;
