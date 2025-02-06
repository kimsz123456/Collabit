import { cn } from "@/shared/lib/shadcn/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatCountBadge from "./ChatCountBadge";
import SurveyStatusBadge from "@/entities/survey/ui/SurveyStatusBadge";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";

interface ChatListCardProps {
  type: "chat" | "survey";
  id: number;
  nickname: string;
  profileImage: string;
  title: string;
  description: string;
  updatedAt: string;
  unRead: number;
}

const ChatListCard = ({
  type,
  id,
  nickname,
  profileImage,
  title,
  description,
  updatedAt,
  unRead,
}: ChatListCardProps) => {
  const pathname = usePathname();
  const isActive = pathname.split("/").pop() === String(id);

  return (
    <Link
      href={`/${type === "chat" ? "chat" : "survey"}/${id}`}
      className={cn(
        "flex justify-between p-2 hover:bg-gray-100",
        isActive && "bg-violet-100",
      )}
    >
      <div className="flex w-full gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profileImage} />
          <AvatarFallback>{nickname.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between">
          <span className="text-sm font-bold md:text-base">{title}</span>
          <span className="w-[calc(100vw-160px)] truncate text-xs text-gray-400 md:w-[160px]">
            {description}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-1">
        <span className="text-nowrap text-xs text-gray-400">
          {formatRelativeTime(updatedAt)}
        </span>
        {type === "chat" && <ChatCountBadge count={unRead} />}
        {type === "survey" && <SurveyStatusBadge status={unRead} />}
      </div>
    </Link>
  );
};

export default ChatListCard;
