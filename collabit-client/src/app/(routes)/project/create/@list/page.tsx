"use client";
import SearchBar from "@/entities/common/ui/SearchBar";
import ProjectSelect from "@/entities/project/ui/ProjectSelect";
import ProjectSortSelect from "@/entities/project/ui/ProjectSort";
import { useAuth } from "@/features/auth/api/useAuth";
import { useGetGithubOrganizationList } from "@/features/project/api/useGetGithubOrganizationList";
import { useGetGithubRepoList } from "@/features/project/api/useGetGithubRepoList";
import ProjectCreateCard from "@/features/project/ui/ProjectCreateCard";
import ProjectCreateCardSkeleton from "@/features/project/ui/ProjectCreateCardSkeleton";
import { getGithubUserReposAPI } from "@/shared/api/github";
import useModalStore from "@/shared/lib/stores/modalStore";
import { ScrollArea } from "@/shared/ui/scroll-area";
import CarouselModal from "@/widget/ui/modals/CarouselModal";
import { CircleHelp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ListPage() {
  const searchParams = useSearchParams();
  const selectedRepo = searchParams.get("repo");

  const { userInfo } = useAuth();
  const githubId = userInfo?.githubId || "";

  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedValue, setSelectedValue] = useState(githubId);
  const { openModal } = useModalStore();

  const { githubUserOrgs, isLoading: isGithubUserLoading } =
    useGetGithubOrganizationList(githubId);

  const { data, isLoading: isUserRepoLoading } = useGetGithubRepoList({
    api: getGithubUserReposAPI,
    direction: sort,
    keyword: selectedValue,
  });

  const isLoading = isUserRepoLoading ?? isGithubUserLoading;
  const myRepo = {
    organization: githubId,
    organizationImage: `https://github.com/${githubId}.png`,
  };

  const handleShowInfo = () => {
    openModal(
      <CarouselModal
        title="Organization 등록 방법"
        description="등록할 Organization 페이지의 People 탭에 들어가 Private을 Public으로 바꿔주세요."
        images={[
          "/images/github/github_how_to_1.png",
          "/images/github/github_how_to_2.png",
          "/images/github/github_how_to_3.png",
        ]}
      ></CarouselModal>,
    );
  };

  useEffect(() => {
    if (githubId) {
      setSelectedValue(githubId);
    }
  }, [githubId]);

  const options = [myRepo, ...githubUserOrgs];

  return (
    <div className="mx-auto flex w-full flex-col justify-center gap-5">
      <div className="flex flex-col gap-2">
        <button
          className="flex items-center justify-start gap-2 p-2 text-xs"
          onClick={handleShowInfo}
        >
          <CircleHelp width={20} height={20} />
          Organization이 보이지 않아요
        </button>
        <div className="flex w-full items-center justify-between gap-2">
          <ProjectSelect
            options={options}
            defaultValue={selectedValue}
            onValueChange={setSelectedValue}
          />
          <ProjectSortSelect sort={sort} onSort={setSort} />
        </div>
        <SearchBar keyword={searchKeyword} setKeyword={setSearchKeyword} />
      </div>

      <ScrollArea className="h-[calc(100vh-444px)] rounded-lg border p-4 md:h-[calc(100vh-402px)]">
        {isLoading ? (
          <ProjectCreateCardSkeleton />
        ) : (
          <ul className="flex w-full flex-col gap-2">
            {data?.map((repo) => (
              <li key={repo.title}>
                <ProjectCreateCard
                  project={repo}
                  isSelected={repo.title === selectedRepo}
                />
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
