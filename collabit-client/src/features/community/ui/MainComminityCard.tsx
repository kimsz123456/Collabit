import UserAvatar from "@/entities/common/ui/UserAvatar";
import { PostListResponse } from "@/shared/types/response/post";
import { Card } from "@/shared/ui/card";
import { Heart } from "lucide-react";

const MainCommunityCard = ({ data }: { data: PostListResponse }) => {
  return (
    <Card className="flex cursor-pointer flex-col justify-between gap-4 px-4 py-6 drop-shadow-lg">
      <UserAvatar size="sm" user={data.author} />
      <p className="text-sm">
        {/* 프로젝트를 열심히 참여하지 않는 사람을 어떻게 해야할까요?
    :( */}
        123
      </p>
      <div className="flex items-center gap-1 text-xs">
        <div className="flex items-center text-gray-500">
          <span>{data.comments}</span>
          <span>개의 답글</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Heart
            className={`${data.isLiked ? "fill-red-500 text-red-500" : ""}`}
            style={{ width: "16px", height: "16px" }}
          />
          <span>{data.likes}</span>
        </div>
      </div>
    </Card>
  );
};

export default MainCommunityCard;
