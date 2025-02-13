"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { UserInfo } from "@/shared/types/model/User";
import { cn } from "@/shared/lib/shadcn/utils";

interface UserAvatarProps {
  user: UserInfo;
  handleLogout?: () => void;
  handleToMyPage?: () => void;
  size?: "sm" | "md";
  time?: string;
}
const UserAvatar = ({ user, size = "md", time }: UserAvatarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn("h-10 w-10", size === "sm" && "h-6 w-6")}>
        <AvatarImage src={user.profileImage} />
        <AvatarFallback className="truncate">
          {user.nickname.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <span className={cn("font-semibold", size === "sm" && "text-md")}>
        {user.nickname}
      </span>
      {time && <span className="text-sm text-muted-foreground">{time}</span>}
    </div>
  );
};

export default UserAvatar;
