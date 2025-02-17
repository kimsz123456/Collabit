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
      <h3 className="sr-only">개발자 협업 역량 분석</h3>
      {userInfo ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 md:items-start md:gap-8">
          <span className="text-center text-2xl font-bold sm:text-3xl md:text-left">
            {userInfo?.nickname}님의
            <br />
            협업 역량을 분석해보세요
          </span>
          <span className="text-center text-sm sm:text-left sm:text-base">
            팀 프로젝트 경험이 있는 동료들에게
            <br />
            나의 협업 스타일에 대한 피드백을 받아보세요.
            <br />
            객관적인 데이터를 통해 성장 포인트를 발견할 수 있습니다.
          </span>
          <Button
            onClick={() => router.push("/project/create")}
            className="text-md h-[50px] max-w-[200px] font-semibold"
          >
            협업 피드백 받기
          </Button>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 md:items-start md:gap-8">
          <span className="text-center text-2xl font-bold sm:text-3xl md:text-left">
            협업 역량을 키워
            <br />더 가치있는 개발자가 되세요
          </span>
          <span className="text-center text-sm sm:text-left sm:text-base">
            동료들의 솔직한 피드백으로 나의 강점을 발견하고
            <br />
            현업 개발자들의 평균 역량과 비교하며
            <br />
            구체적인 성장 방향을 찾아보세요.
          </span>
          <Button
            onClick={() => router.push("/project/create")}
            className="text-md h-[50px] max-w-[200px] font-semibold"
          >
            무료로 시작하기
          </Button>
        </div>
      )}
      <div className="flex h-[440px] w-full min-w-[200px] max-w-[500px] flex-col items-center justify-center rounded-md bg-gray-50 p-4 sm:min-w-[200px]">
        <div className="mb-1 flex flex-col items-center gap-1">
          <h4 className="text-base font-semibold text-gray-800">
            협업 역량 지표
          </h4>
          <p className="text-center text-xs text-gray-600">
            콜라빗 이용자 평균 데이터
          </p>
        </div>
        <div className="h-10/12 relative w-10/12 min-w-[280px] pt-2 sm:min-w-[360px]">
          <HexagonChart hexagon={data} />
          <div className="absolute -bottom-2 left-0 right-0 text-center text-[11px] text-gray-500">
            * 6가지 핵심 역량을 5점 만점으로 평가
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompareScoreSection;
