"use client";
import PageHeader from "@/entities/common/ui/PageHeader";
import SearchBar from "@/entities/common/ui/SearchBar";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import ProjectList from "@/widget/project/ui/ProjectList";
import ProjectListSkeleton from "@/widget/project/ui/ProjectListSkeleton";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

export default function Page() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("LATEST");


  const handleSort = (value: string) => {
    setSort(value);
  };
  const handleCreateProject = () => {
    router.push("/project/create");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-5 py-10">
      <PageHeader
        mainTitle="나의 프로젝트"
        subTitle="동료들에게 피드백 받은 현황을 확인할 수 있어요."
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <SearchBar keyword={keyword} setKeyword={setKeyword} />
          <Select defaultValue={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LATEST">최신순</SelectItem>
              <SelectItem value="PARTICIPATION">참여율 높은순</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateProject}>프로젝트 등록</Button>
        </div>
        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectList keyword={keyword} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
