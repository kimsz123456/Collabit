import ReportTitle from "@/entities/report/ui/ReportTitle";
import { AISummaryResponse } from "@/shared/types/response/report";
const AISummarySection = ({
  strength,
  weakness,
}: AISummaryResponse) => {
  return (
    <div className="flex flex-col gap-4 bg-white">
      <ReportTitle title="AI 강약점 요약" />
      <div className="flex flex-col gap-2">
        <span className="md:text-md rounded-lg bg-green-50 p-4 text-sm">
          {strength}
        </span>
        <span className="md:text-md rounded-lg bg-red-50 p-4 text-sm">
          {weakness}
        </span>
      </div>
    </div>
  );
};
export default AISummarySection;
