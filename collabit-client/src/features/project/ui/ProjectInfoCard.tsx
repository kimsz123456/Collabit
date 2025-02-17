import { FormattedGithubRepo } from "@/shared/types/response/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { BookA, Bug, Clock3, GitFork, Star } from "lucide-react";
import Image from "next/image";
import useGetGithubContributors from "@/features/project/api/useGetGithubContributors";
import { useCreateProject } from "@/features/project/api/useCreateProject";
import ProjectCreateButton from "@/entities/project/ui/ProjectCreateButton";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/hooks/use-toast";

interface ProjectInfoCardProps {
  repo: FormattedGithubRepo;
}

export function ProjectInfoCard({ repo }: ProjectInfoCardProps) {
  const { contributors, isLoading } = useGetGithubContributors(
    repo.organization,
    repo.title,
  );
  const { toast } = useToast();
  const { addedProjects, isAdded } = useCreateProject(
    repo.organization,
    repo.title,
  );
  const DEPLOY_URL = process.env.NEXT_PUBLIC_DEPLOY_URL;
  const project = addedProjects?.find((project) => {
    return (
      project.organization === repo.organization && project.title === repo.title
    );
  });
  const surveyUrl = `${DEPLOY_URL}/survey/${project?.code}`;
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
    <ScrollArea className="flex h-full max-h-[calc(100vh-300px)] flex-col gap-4 overflow-y-auto rounded-lg border p-4 md:max-h-[calc(100vh-260px)]">
      <div className="mb-5 flex w-full items-center justify-between gap-4">
        <div className="flex w-full items-center gap-2">
          <Avatar>
            <AvatarImage src={repo.organizationImage} />
            <AvatarFallback>{repo.organization.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <h2 className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold">
            {repo.title}
          </h2>
        </div>
        <button
          className="p-2"
          onClick={() => window.open(repo.html_url, "_blank")}
        >
          <Image
            width={32}
            height={32}
            src="/images/github-profile.png"
            alt="Github Profile"
          />
        </button>
      </div>

      <div className="my-2 flex flex-col gap-2">
        <div className="text-md mb-2 flex items-center gap-1.5">
          <BookA className="h-5 w-5" />
          <span>언어 : {repo.language || "없음"}</span>
        </div>
        <div className="text-md mb-2 flex items-center gap-1.5">
          <Clock3 className="h-5 w-5" />
          <span>
            업데이트: {new Date(repo.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-2">
        <Badge
          variant="secondary"
          className="flex w-full items-center justify-center gap-2 py-2"
        >
          <Star className="size-10 h-5 w-5 fill-yellow-300 text-yellow-300" />
          <span>{repo.stargazers_count}</span>
        </Badge>
        <Badge
          variant="secondary"
          className="flex w-full items-center justify-center gap-2 py-2"
        >
          <GitFork className="h-5 w-5" />
          <span>{repo.forks_count}</span>
        </Badge>
        <Badge
          variant="secondary"
          className="flex w-full items-center justify-center gap-2 py-2"
        >
          <Bug className="h-5 w-5" />
          <span>{repo.open_issues_count}</span>
        </Badge>
      </div>
      <div className="my-4">
        {isAdded ? (
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
        ) : (
          <ProjectCreateButton
            project={repo}
            className="w-full bg-violet-600"
          />
        )}
      </div>
      <hr className="my-5" />
      <div>
        <h3 className="mb-2 text-lg font-semibold">Contributors</h3>
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <p>로딩 중...</p>
          ) : (
            contributors?.map((contributor) => (
              <div
                key={contributor.githubId}
                className="flex items-center gap-2 rounded-full bg-gray-100 p-2"
              >
                <Image
                  src={contributor.profileImage}
                  alt={contributor.githubId}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{contributor.githubId}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
