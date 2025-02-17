import { useAuth } from "@/features/auth/api/useAuth";
import { updateUserNicknameAPI } from "@/shared/api/user";
import useModalStore from "@/shared/lib/stores/modalStore";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import OneButtonModal from "../../../widget/ui/modals/OneButtonModal";
import { useState } from "react";

const NicknameChangeModal = () => {
  const { userInfo } = useAuth();
  const { openModal, closeModal } = useModalStore((state) => state);
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState<string>(userInfo?.nickname || "");

  const { mutate: updateNickname } = useMutation({
    mutationFn: updateUserNicknameAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      openModal(
        <OneButtonModal
          title="닉네임 변경 완료"
          description="닉네임이 변경되었습니다."
          buttonText="확인"
          handleButtonClick={closeModal}
        />,
      );
    },
    onError: () => {
      openModal(
        <OneButtonModal
          title="닉네임 변경 실패"
          description="닉네임 변경에 실패했습니다."
          buttonText="확인"
          handleButtonClick={closeModal}
        />,
      );
    },
  });

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
          <h2 className="text-lg font-semibold">닉네임 변경</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요..."
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4 flex w-full justify-center">
          <Button
            type="button"
            className="h-11 w-32 font-medium transition-colors md:h-12 md:w-40"
            onClick={() => updateNickname({ nickname })}
            disabled={!nickname.trim() || nickname === userInfo?.nickname}
          >
            변경
          </Button>
        </div>
      </div>
    </>
  );
};

export default NicknameChangeModal;
