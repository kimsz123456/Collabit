import UserAvatar from "@/entities/common/ui/UserAvatar";
import { CommentResponse } from "@/shared/types/response/comment";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { CornerDownRight } from "lucide-react";

const CommentChildCard = ({ child }: { child: CommentResponse }) => {
  return (
    <div className="ml-8 flex flex-col gap-2" key={child.code}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CornerDownRight className="h-4 w-4" />
          <UserAvatar user={child.author} size="sm" />
        </div>
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(child.createdAt)}
        </span>
      </div>
      <p className="ml-14 text-sm">{child.content}</p>
    </div>
  );
};

export default CommentChildCard;
