import { getOrCreateChatRoomAPI } from "@/shared/api/chat";
import useModalStore from "@/shared/lib/stores/modalStore";
import { ChatUser } from "@/shared/types/response/chat";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";
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
    router.push(`/chat/${newChatRoom.roomCode}`);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/50"
        onClick={(e) => {
          e.stopPropagation();
          closeModal();
        }}
      />
      <div
        className="fixed left-1/2 top-1/2 z-20 min-w-[320px] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-xl bg-white p-8 shadow-2xl transition-all md:min-w-[440px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={closeModal}
        >
          <X />
        </Button>
        <div className="mb-4 flex flex-col items-center justify-center gap-5">
          <div id="chat-modal-title" className="flex items-center gap-4">
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
          <textarea
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="채팅 메시지를 입력하세요..."
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div className="mt-4 flex w-full justify-center">
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
    </>
  );
};

export default ChatMessageModal;
