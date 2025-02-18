"use client";
import ProjectCotnributor from "@/entities/project/ui/ProjectContributor";
import { ProjectResponse } from "@/shared/types/response/project";
import { Button } from "@/shared/ui/button";
import { Card, CardTitle } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Progress } from "@/shared/ui/progress";
import calcRatio from "@/shared/utils/calcRatio";
import { DeleteIcon, Ellipsis, GithubIcon } from "lucide-react";
import { useProjectList } from "../api/useProjectList";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";

interface ProjectListCardProps {
  project: ProjectResponse;
  organization: string;
  // onClick?: (e: React.MouseEvent) => void;
}

const MainProjectListCard = ({
  project,
  organization,
}: ProjectListCardProps) => {
  const { handleFinishSurvey, handleRemoveProject } = useProjectList();

  const contributorsCount = project.contributors.length;
  const participantsRatio = calcRatio(project.participant, contributorsCount);

  return (
    <Card className="flex h-full cursor-pointer flex-col items-center justify-between bg-violet-50 px-4 py-3 drop-shadow-lg">
      <div className="flex w-full items-center justify-between gap-10">
        <ProjectCotnributor contributor={project.contributors} />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-10 w-10 items-center justify-center rounded-full text-violet-300"
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
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <CardTitle className="w-full truncate text-lg">
            {project.title}
          </CardTitle>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(project.createdAt)}
          </span>
        </div>
        {project.done ? (
          <>
            <Button className="z-5 disabled shrink-0 bg-gray-400 px-2 text-xs font-semibold">
              종료됨
            </Button>
          </>
        ) : (
          <Button
            className="z-5 shrink-0 bg-black px-2 text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              handleFinishSurvey(project.code);
            }}
          >
            설문 종료
          </Button>
        )}
      </div>
      <div className="items-left flex w-full flex-col justify-center gap-2">
        <span className="text-sm">
          <span className="font-semibold">{project.contributors.length}</span>명
          중 <span className="font-semibold">{project.participant}</span>명 참여
          / <span className="font-semibold">{participantsRatio}</span>%
        </span>
        <Progress
          className="h-1 bg-white [&>div]:rounded-full [&>div]:bg-black [&>div]:transition-all"
          value={participantsRatio}
        />
      </div>
    </Card>
  );
};

export default MainProjectListCard;
