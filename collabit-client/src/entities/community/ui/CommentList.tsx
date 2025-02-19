"use client";
import UserAvatar from "@/entities/common/ui/UserAvatar";
import { getCommentAPI } from "@/shared/api/comment";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CommentReplyInput from "./CommentReplyInput";
import CommentChildCard from "./CommentChildCard";
import { useAuth } from "@/features/auth/api/useAuth";
import { Button } from "@/shared/ui/button";
import { getChatRoomWithNicknameAPI } from "@/shared/api/chat";
import { useRouter } from "next/navigation";
import useModalStore from "@/shared/lib/stores/modalStore";
import ChatMessageModal from "@/widget/ui/modals/ChatMessageModal";
import { Send } from "lucide-react";
import { ChatUser } from "@/shared/types/response/chat";

const CommentList = ({ postCode }: { postCode: number }) => {
  const { userInfo } = useAuth();
  const router = useRouter();
  const { openModal } = useModalStore();

  const { data } = useQuery({
    queryKey: ["commentList", postCode],
    queryFn: () => getCommentAPI(postCode),
    enabled: !!postCode,
  });

  const [activeReplyInputs, setActiveReplyInputs] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleReplyInput = (commentCode: number) => {
    setActiveReplyInputs((prev) => ({
      ...prev,
      [commentCode]: !prev[commentCode],
    }));
  };

  const handleCheckChatRoom = async (
    e: React.MouseEvent<HTMLButtonElement>,
    author: ChatUser,
  ) => {
    e.preventDefault();
    if (!userInfo) return;

    const chatRoom = await getChatRoomWithNicknameAPI(author.nickname);

    if (chatRoom.roomCode !== -1) {
      // 기존 채팅방이 존재하면 이동
      router.push(`/chat/${chatRoom.roomCode}`);
    } else {
      openModal(<ChatMessageModal author={author} />);
    }
  };

  return (
    <ul className="mx-2 mb-10 flex flex-col gap-6">
      {data?.map((item) => (
        <li key={item.code} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserAvatar user={item.author} size="sm" />
              <button
                className="text-sm text-muted-foreground"
                onClick={() => toggleReplyInput(item.code)}
              >
                답글달기
              </button>
              {userInfo && item.author.nickname !== userInfo.nickname && (
                <Button
                  variant="ghost"
                  className="flex items-center px-2 py-1"
                  disabled={!userInfo}
                  onClick={(e) => handleCheckChatRoom(e, item.author)}
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="ml-8">{item.content}</p>

          {activeReplyInputs[item.code] && (
            <CommentReplyInput
              onCancel={() => toggleReplyInput(item.code)}
              postCode={postCode}
              parentCommentCode={item.code}
            />
          )}

          {item.replies?.map((child) => (
            <CommentChildCard key={child.code} child={child} />
          ))}
        </li>
      ))}
    </ul>
  );
};

export default CommentList;
