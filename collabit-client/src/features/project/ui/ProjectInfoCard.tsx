import { FormattedGithubRepo } from "@/shared/types/response/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { BookA, Bug, Clock3, GitFork, Star } from "lucide-react";
import Image from "next/image";
import useGetGithubContributors from "../api/useGetGithubContributors";

interface ProjectInfoCardProps {
  repo: FormattedGithubRepo;
}

export function ProjectInfoCard({ repo }: ProjectInfoCardProps) {
  const { contributors, isLoading } = useGetGithubContributors(
    repo.organization,
    repo.title,
  );

  return (
    <ScrollArea className="flex h-full max-h-[calc(100vh-260px)] flex-col gap-4 overflow-y-auto rounded-lg border p-4">
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
