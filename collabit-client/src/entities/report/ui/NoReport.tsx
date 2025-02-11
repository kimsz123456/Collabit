import { Button } from "@/shared/ui/button";
import Image from "next/image";

const NoReport = ({
  handleGenerateReport,
  currentCount,
  requiredCount,
}: {
  handleGenerateReport: () => void;
  currentCount: number;
  requiredCount: number;
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8">
        <Image
          src="/images/empty-report.svg"
          alt="빈 리포트"
          width={300}
          height={300}
          className="h-auto w-auto"
        />

        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="text-md font-medium text-gray-500">
            받은 평가 응답
          </span>
          <div className="text-2xl font-bold text-primary">
            {currentCount}

            <span className="ml-1 text-base font-normal text-gray-500">개</span>
          </div>
          <span className="text-sm text-gray-500">
            최소 <span className="font-semibold">{requiredCount}</span>개의
            응답이 필요합니다
          </span>
        </div>

        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            아직 리포트가 생성되지 않았어요
          </h2>
          <p className="text-gray-600">
            동료들의 평가를 {requiredCount}개 이상 받으면 리포트가 생성됩니다.
            지금 바로 리포트를 생성해보세요!
          </p>
          {currentCount && currentCount >= requiredCount ? (
            <Button onClick={handleGenerateReport} size="lg" className="mt-4">
              리포트 생성하기
            </Button>
          ) : (
            <Button size="lg" className="mt-4 bg-gray-300" disabled>
              리포트 생성하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoReport;
