import { Button } from "@/shared/ui/button";
import { FormattedGithubRepo } from "@/shared/types/response/github";
import { useCreateProject } from "@/features/project/api/useCreateProject";
import useGetGithubContributors from "@/features/project/api/useGetGithubContributors";

interface ProjectCreateButtonProps {
  project: FormattedGithubRepo;
  className?: string;
}

export default function ProjectCreateButton({
  project,
  className,
}: ProjectCreateButtonProps) {
  const { contributors } = useGetGithubContributors(
    project.organization,
    project.title,
  );
  const { handleAddProject, isAdded } = useCreateProject(
    project.organization,
    project.title,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdded) {
      handleAddProject({
        ...project,
        contributors: contributors || [],
      });
    }
  };

  if (isAdded) {
    return (
      <Button
        variant="outline"
        className={`w-[60px] cursor-not-allowed bg-gray-500 text-white ${className}`}
        disabled
      >
        완료
      </Button>
    );
  }

  return (
    <Button className={`w-[60px] bg-black ${className}`} onClick={handleClick}>
      등록
    </Button>
  );
}
