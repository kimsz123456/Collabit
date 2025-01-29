"use client";

import ProjectHeader from "@/entities/project/ui/ProjectHeader";
import ProjectInput from "@/entities/project/ui/ProjectInput";
import { useState } from "react";
import ProjectCardDone from "@/widget/project/ui/ProjectCardDone";
import ProjectCardNotDone from "@/widget/project/ui/ProjectCardNotDone";

export default function Page() {
  const [keyword, setKeyword] = useState("");

  const handleSearchKeyword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault;
    console.log(keyword);
    setKeyword("");
  };

  const projectInfo = [
    {
      code: 1,
      title: "프로젝트 A",
      total: 5,
      participant: 3,
      isDone: true,
      surveyUrl: "https://survey-link.com",
      contributor: [
        {
          code: 1,
          githubId: "id1",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 2,
          githubId: "id2",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 3,
          githubId: "id3",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 4,
          githubId: "id4",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 5,
          githubId: "id5",
          profileImage: "https://github.com/shadcn.png",
        },
      ],
    },
    {
      code: 2,
      title: "프로젝트 B",
      total: 3,
      participant: 1,
      isDone: false,
      surveyUrl: "https://survey-link.com",
      contributor: [
        {
          code: 1,
          githubId: "id1",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 2,
          githubId: "id2",
          profileImage: "https://github.com/shadcn.png",
        },
        {
          code: 3,
          githubId: "id3",
          profileImage: "https://github.com/shadcn.png",
        },
      ],
    },
  ];
  return (
    <div className="mx-auto flex w-full flex-col justify-center gap-5 py-10 md:w-[540px]">
      <ProjectHeader
        mainTitle="나의 프로젝트"
        subTitle="동료들에게 피드백 받은 현황을 확인할 수 있어요."
        isList={true}
      />
      <div className="flex items-center justify-between gap-2">
        <ProjectInput
          keyword={keyword}
          setKeyword={setKeyword}
          handleSearchKeyword={handleSearchKeyword}
        />
      </div>
      {projectInfo.map((project) =>
        project.isDone ? (
          <ProjectCardDone key={project.code} project={project} />
        ) : (
          <ProjectCardNotDone key={project.code} project={project} />
        ),
      )}
    </div>
  );
}
