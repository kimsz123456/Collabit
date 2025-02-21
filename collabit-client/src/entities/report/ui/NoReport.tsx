import { Button } from "@/shared/ui/button";
import { Info } from "lucide-react";

const NoReport = ({
  handleGenerateReport,
  currentCount,
  requiredCount,
  projectCount,
}: {
  handleGenerateReport: () => void;
  currentCount: number;
  requiredCount: number;
  projectCount: number;
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          아직 리포트가 생성되지 않았어요
        </h2>
        <p className="max-w-lg text-center text-gray-600">
          동료들의 평가를{" "}
          <span className="font-semibold">{requiredCount}개</span> 이상 받으면
          리포트가 생성됩니다.
        </p>

        {/* 프로젝트 마감 안내 박스 추가 */}
        <div className="flex w-full max-w-md items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-500" />
          <div>
            <p className="font-medium text-violet-700">
              프로젝트 마감이 필요합니다
            </p>
            <p className="mt-1 text-sm text-violet-600">
              설문 응답은 프로젝트를 종료해야만 반영됩니다. 진행 중인 프로젝트가
              있다면 마감해 주세요.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-gray-50 p-5">
          <h3 className="text-center text-lg font-semibold text-gray-900">
            현재 상태
          </h3>
          <div className="flex items-center justify-center gap-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <span className="text-md font-medium text-gray-500">
                종료된 프로젝트
              </span>
              <div className="mt-1 text-2xl font-bold text-primary">
                {projectCount}
                <span className="ml-1 text-base font-normal text-gray-500">
                  개
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-md font-medium text-gray-500">
                응답 합계
              </span>
              <div className="mt-1 text-2xl font-bold text-primary">
                {currentCount}
                <span className="ml-1 text-base font-normal text-gray-500">
                  개
                </span>
              </div>
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-primary"
              style={{
                width: `${Math.min(100, (currentCount / requiredCount) * 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600">
            리포트 생성까지{" "}
            <span className="font-bold text-primary">
              {Math.max(0, requiredCount - currentCount)}개
            </span>
            의 응답이 더 필요합니다
          </p>
        </div>

        <div className="w-full max-w-md space-y-4 text-center">
          {currentCount && currentCount >= requiredCount ? (
            <Button onClick={handleGenerateReport} size="lg" className="w-full">
              리포트 생성하기
            </Button>
          ) : (
            <div className="space-y-2">
              <Button size="lg" className="w-full bg-gray-300" disabled>
                리포트 생성하기
              </Button>
              <p className="text-sm text-gray-500">
                {requiredCount}개 이상의 응답이 모이면 버튼이 활성화됩니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoReport;
