import useModalStore from "@/shared/lib/stores/modalStore";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";

interface OneButtonModalProps {
  title: string;
  description: string;
  buttonText: string;
  handleButtonClick: () => void;
}

const OneButtonModal = ({
  title,
  description,
  buttonText,
  handleButtonClick,
}: OneButtonModalProps) => {
  const closeModal = useModalStore((state) => state.closeModal);
  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (handleButtonClick) {
            handleButtonClick();
          } else {
            closeModal();
          }
        }}
      />
      <div
        className="fixed left-1/2 top-1/2 z-20 w-[90%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-xl bg-white p-6 shadow-2xl transition-all md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => {
          e.stopPropagation();
          if (handleButtonClick) {
            handleButtonClick();
          } else {
            closeModal();
          }
        }}
      >
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={closeModal}
        >
          <X />
        </Button>
        <div className="flex flex-col items-center justify-center gap-2 px-4 md:px-6">
          <h1
            id="modal-title"
            className="break-keep text-center text-lg font-bold text-gray-800 md:text-xl"
          >
            {title}
          </h1>
          <p className="max-w-full whitespace-pre-wrap break-keep text-center text-sm text-gray-600">
            {description}
          </p>
        </div>
        <div className="mt-6 flex w-full justify-center md:mt-8">
          <Button
            type="button"
            className="h-11 w-32 font-medium transition-colors md:h-12 md:w-40"
            onClick={handleButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </>
  );
};

export default OneButtonModal;
