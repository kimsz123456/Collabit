import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { FormattedGithubRepo } from "@/shared/types/response/github";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/shared/lib/shadcn/utils";
import ProjectCreateButton from "@/entities/project/ui/ProjectCreateButton";

interface ProjectCreateCardProps {
  project: FormattedGithubRepo;
  isSelected?: boolean;
}

const ProjectCreateCard = ({ project, isSelected }: ProjectCreateCardProps) => {
  const router = useRouter();
  const timeAgo = formatRelativeTime(project.updated_at);

  return (
    <Card
      className={cn(
        "flex h-[60px] w-full cursor-pointer items-center justify-between px-4 transition-colors",
        isSelected ? "bg-violet-200" : "bg-violet-50 hover:bg-violet-100",
      )}
      onClick={() => {
        router.push(
          `/project/create?keyword=${project.organization}&repo=${project.title}`,
        );
      }}
    >
      <div className="flex min-w-0 flex-shrink flex-row items-center justify-between gap-4">
        <Image
          width={24}
          height={24}
          src="/images/github-profile.png"
          alt="Github Profile"
          className="flex-shrink-0"
        />
        <CardTitle className="text-md min-w-0 flex-shrink overflow-hidden text-ellipsis whitespace-nowrap">
          {project.title}
        </CardTitle>
      </div>
      <div className="flex flex-grow items-center justify-end gap-2">
        <CardDescription className="mr-4 text-nowrap text-right text-gray-500">
          {timeAgo}
        </CardDescription>
        <ProjectCreateButton project={project} />
      </div>
    </Card>
  );
};

export default ProjectCreateCard;
