import { useToast } from "@/shared/hooks/use-toast";
import { ProjectResponse } from "@/shared/types/response/project";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import ProjectListCard from "@/features/project/ui/ProjectListCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

interface SurveySharingModalProps {
  project: ProjectResponse;
  organization: string;
}

const SurveySharingModal = ({
  project,
  organization,
}: SurveySharingModalProps) => {
  const { toast } = useToast();
  const DEPLOY_URL = process.env.NEXT_PUBLIC_DEPLOY_URL;
  const surveyUrl = `${DEPLOY_URL}/survey/${project.code}`;
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
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <ProjectListCard organization={organization} project={project} />
        </div>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <DialogTitle className="text-center text-lg font-bold">
            설문 링크 공유
          </DialogTitle>
          <DialogDescription className="mb-8 mt-1 text-center text-xs text-gray-400">
            아래의 링크를 복사해서 동료들에게 피드백을 요청하세요.
          </DialogDescription>
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
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default SurveySharingModal;
