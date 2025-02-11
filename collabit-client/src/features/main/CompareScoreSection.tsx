"use client";

import { Button } from "@/shared/ui/button";
import { useAuth } from "../auth/api/useAuth";
import { useRouter } from "next/navigation";
import HexagonChart from "@/entities/chart/ui/HexagonChart";
import { ChartRangeData, SkillData } from "@/shared/types/response/report";

const CompareScoreSection = () => {
  const { userInfo } = useAuth();
  const router = useRouter();

  const data: ChartRangeData & SkillData = {
    minScore: 1,
    maxScore: 5,
    sympathy: { name: "공감(S)", score: 3.5 },
    listening: { name: "경청(A)", score: 3.3 },
    expression: { name: "표현(E)", score: 3.1 },
    problemSolving: { name: "문제해결(PS)", score: 3.9 },
    conflictResolution: { name: "갈등해결(CS)", score: 4.1 },
    leadership: { name: "리더십(L)", score: 2.8 },
  };

  return (
    <section className="flex w-full flex-wrap items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 sm:flex-nowrap md:px-14">
      <h3 className="sr-only">사용자 평균 협업 점수</h3>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 md:items-start md:gap-8">
        <span className="text-center text-2xl font-bold sm:text-3xl md:text-left">
          안녕하세요,
          <span>{userInfo?.nickname}님!</span>
        </span>
        <span className="text-center text-sm sm:text-left sm:text-base">
          협업했던 팀원들에게 피드백을 받고, <br />
          개발자들의 평균 점수와 나의 점수를 확인해보세요.
        </span>
        <Button
          onClick={() => router.push("/project/create")}
          className="text-md h-[50px] max-w-[200px] font-semibold"
        >
          피드백 요청하기
        </Button>
      </div>
      <div className="flex h-[300px] w-full max-w-[600px] items-center justify-center rounded-md bg-gray-50 p-4">
        <HexagonChart hexagon={data} />
      </div>
    </section>
  );
};

export default CompareScoreSection;
