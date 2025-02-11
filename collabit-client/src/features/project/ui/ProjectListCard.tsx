import ProjectCotnributor from "@/entities/project/ui/ProjectContributor";
import { ProjectResponse } from "@/shared/types/response/project";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Progress } from "@/shared/ui/progress";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { DeleteIcon, Ellipsis, GithubIcon } from "lucide-react";
import { useProjectList } from "@/features/project/api/useProjectList";
import calcRatio from "@/shared/utils/calcRatio";

interface ProjectListCardProps {
  organization: string;
  project: ProjectResponse;
  onClick?: (e: React.MouseEvent) => void;
}

const ProjectListCard = ({
  project,
  organization,
  onClick,
}: ProjectListCardProps) => {
  const { handleRemoveProject, handleFinishSurvey } = useProjectList();

  const contributorsCount = project.contributors?.length;
  const participantsRatio = calcRatio(project.participant, contributorsCount);

  return (
    <Card
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-between gap-3 bg-violet-50 px-4 py-4 drop-shadow-lg"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CardTitle className="truncate text-lg">{project.title}</CardTitle>
          <CardDescription className="shrink-0 text-xs">
            {formatRelativeTime(project.createdAt)}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="z-10 flex h-5 w-5 shrink-0 items-center justify-center text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* 설문 참여 인원이 0명일 때만 프로젝트 삭제 가능*/}
            {project.participant == 0 && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveProject(project.code);
                }}
                className="cursor-pointer text-red-500"
              >
                <DeleteIcon />
                프로젝트 삭제
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://github.com/${organization}/${project.title}`,
                )
              }
              className="cursor-pointer"
            >
              <GithubIcon />
              github으로 이동
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full items-center justify-between gap-10">
        <div className="items-left flex w-full flex-col justify-center gap-2">
          <div className="flex items-center">
            <ProjectCotnributor size="sm" contributor={project.contributors} />
            <span className="text-sm">
              <span className="font-semibold">{contributorsCount}</span>명 중{" "}
              <span className="font-semibold">{project.participant}</span>명
              참여 / <span className="font-semibold">{participantsRatio}</span>%
            </span>
          </div>
          <Progress
            className="h-1 bg-white [&>div]:rounded-full [&>div]:bg-black [&>div]:transition-all"
            value={participantsRatio}
          />
        </div>
        {project.done ? (
          <>
            <Button className="z-5 disabled bg-gray-400">종료됨</Button>
          </>
        ) : (
          <Button
            className="z-5 bg-black"
            onClick={(e) => {
              e.stopPropagation();
              handleFinishSurvey(project.code);
            }}
          >
            설문 종료
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProjectListCard;
