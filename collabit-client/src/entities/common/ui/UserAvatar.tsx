"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import HeaderDropDown from "./HeaderDropDown";
import { ChevronDown } from "lucide-react";
import { UserInfo } from "@/shared/types/model/User";
import { cn } from "@/shared/lib/shadcn/utils";

interface UserAvatarProps {
  user: UserInfo;
  handleLogout?: () => void;
  handleToMyPage?: () => void;
  size?: "sm" | "md";
}
const UserAvatar = ({
  user,
  handleLogout,
  handleToMyPage,
  size = "md",
}: UserAvatarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn("h-10 w-10", size === "sm" && "h-6 w-6")}>
        <AvatarImage src={user.profileImage} />
        <AvatarFallback>{user.nickname.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <span className={cn("font-semibold", size === "sm" && "text-md")}>
        {user.nickname}
      </span>
      {handleToMyPage && handleLogout && (
        <HeaderDropDown
          Icon={ChevronDown}
          handleToMyPage={handleToMyPage}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default UserAvatar;
