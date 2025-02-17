"use client";

import { Button } from "@/shared/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/shared/lib/shadcn/utils";
import {
  PostDetailResponse,
  PostListResponse,
} from "@/shared/types/response/post";
import { getChatRoomWithNicknameAPI } from "@/shared/api/chat";
import { useRouter } from "next/navigation";
import useModalStore from "@/shared/lib/stores/modalStore";
import ChatMessageModal from "@/widget/ui/modals/ChatMessageModal";
import { useAuth } from "@/features/auth/api/useAuth";

export const CommunityCardActions = ({
  post,
}: {
  post: PostListResponse | PostDetailResponse;
}) => {
  const nickname = post?.author?.nickname;
  const { userInfo } = useAuth();
  const router = useRouter();
  const { openModal } = useModalStore();

  const handleCheckChatRoom = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const chatRoom = await getChatRoomWithNicknameAPI(nickname);
    //채팅방이 있으면 채팅방으로 이동, 없으면 채팅방 생성
    if (chatRoom.roomCode != -1) {
      router.push(`/chat/${chatRoom.roomCode}`);
    } else {
      openModal(<ChatMessageModal author={post?.author} />);
    }
  };

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <div className="flex items-center gap-1 px-2 py-1">
        <MessageCircle className="size-4" />
        <span className="text-sm">{post?.commentCount}</span>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" className="flex items-center px-2 py-1">
          <Heart
            className={cn("size-4", post?.liked && "fill-red-500 text-red-500")}
          />
          <span className="text-sm">{post?.likeCount}</span>
        </Button>
      </div>
      {nickname !== userInfo?.nickname && (
        <Button
          variant="ghost"
          className="flex items-center px-2 py-1"
          onClick={handleCheckChatRoom}
        >
          <Send className="size-4" />
        </Button>
      )}
    </div>
  );
};
