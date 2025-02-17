import useModalStore from "@/shared/lib/stores/modalStore";
import { updateUserImageAPI } from "@/shared/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const ImageChangeModal = () => {
  const { closeModal, openModal } = useModalStore((state) => state);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { mutate: updateUserImage } = useMutation({
    mutationFn: updateUserImageAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      openModal(
        <OneButtonModal
          title="이미지 변경 완료"
          description="프로필 이미지가 변경되었습니다."
          buttonText="확인"
          handleButtonClick={closeModal}
        />,
      );
    },
    onError: () => {
      openModal(
        <OneButtonModal
          title="이미지 변경 실패"
          description="이미지 변경에 실패했습니다."
          buttonText="확인"
          handleButtonClick={closeModal}
        />,
      );
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFile(file);
  };

  const handleSubmit = () => {
    if (!file) return;
    updateUserImage({ image: file });
  };

  return (
    <>
      <div className="fixed inset-0 z-10 bg-black/50" onClick={closeModal} />
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
        <div className="w-full max-w-[400px] rounded-lg bg-white p-4">
          <h2 className="text-center text-lg font-semibold">
            프로필 이미지 변경
          </h2>

          <div className="mt-4 flex flex-col items-center justify-center">
            <label
              htmlFor="image-upload"
              className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="미리보기"
                  className="h-40 w-40 rounded-full object-cover"
                  width={160}
                  height={160}
                />
              ) : (
                <ImagePlus className="h-10 w-10 text-gray-400" />
              )}
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="mt-4 flex w-full justify-center">
            <Button
              type="button"
              className="h-11 w-32 font-medium transition-colors md:h-12 md:w-40"
              onClick={handleSubmit}
              disabled={!file}
            >
              변경
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageChangeModal;
