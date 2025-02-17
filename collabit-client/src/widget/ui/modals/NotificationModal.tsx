import { toast } from "@/shared/hooks/use-toast";
import useModalStore from "@/shared/lib/stores/modalStore";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { X } from "lucide-react";

interface NotificationModalProps {
  title: string;
  description: string;
  buttonText: string;
  handleButtonClick: () => void;
}

const NotificationModal = ({
  title,
  description,
  buttonText,
  handleButtonClick,
}: NotificationModalProps) => {
  const closeModal = useModalStore((state) => state.closeModal);
  const surveyUrl = "https://forms.gle/FRGJ7QyBSwBvxRMx7";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      await navigator.clipboard.writeText(surveyUrl);
      toast({
        description: "링크가 복사되었습니다.",
      });
    } catch {
      toast({
        variant: "destructive",
        description: "링크 복사에 실패했습니다.",
      });
    }
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
        aria-labelledby="modal-title"
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
        <div className="flex flex-col items-center justify-center gap-5 px-6">
          <h1 id="modal-title" className="text-xl font-bold text-gray-800">
            {title}
          </h1>
          <p className="whitespace-pre-line text-center text-sm text-gray-600">
            {description}
          </p>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                value={surveyUrl}
                className="select-all"
                readOnly
              />
            </div>
            <Button
              onClick={handleCopy}
              type="submit"
              size="sm"
              className="px-3"
            >
              <span className="sr-only">Copy</span>
              링크 복사
            </Button>
          </div>
        </div>
        <div className="mt-8 flex w-full justify-center">
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

export default NotificationModal;
