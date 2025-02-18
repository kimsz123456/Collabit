import { getOrCreateChatRoomAPI } from "@/shared/api/chat";
import useModalStore from "@/shared/lib/stores/modalStore";
import { ChatUser } from "@/shared/types/response/chat";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChatMessageModalProps {
  author: ChatUser;
}

const ChatMessageModal = ({ author }: ChatMessageModalProps) => {
  const router = useRouter();
  const closeModal = useModalStore((state) => state.closeModal);
  const [chatMessage, setChatMessage] = useState<string>("");

  const handleCreateChatRoom = async () => {
    if (chatMessage.trim() === "") return;

    const newChatRoom = await getOrCreateChatRoomAPI({
      nickname: author.nickname,
      message: chatMessage,
    });
    closeModal();
    router.push(`/chat/${newChatRoom.roomCode}`);
  };

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <Image
                src={author.profileImage}
                alt={`${author.nickname}의 프로필`}
                className="h-12 w-12 rounded-full"
                width={48}
                height={48}
              />
              <span className="text-xl font-bold text-gray-800">
                {author.nickname}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <textarea
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="채팅 메시지를 입력하세요..."
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              className="h-11 w-32 font-medium transition-colors md:h-12 md:w-40"
              onClick={handleCreateChatRoom}
              disabled={!chatMessage.trim()}
            >
              전송
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatMessageModal;
