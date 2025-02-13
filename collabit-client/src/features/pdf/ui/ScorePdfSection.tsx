import { ChartRangeData, SkillData } from "@/shared/types/response/report";
import HexagonPdfSection from "./HexagonPdfSection";
import ProgressPdfSection from "./ProgressPdfSection";

interface ScorePdfSectionProps {
  hexagon: ChartRangeData & SkillData;
  progress: SkillData;
}

const ScorePdfSection = ({ hexagon, progress }: ScorePdfSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="my-4 text-[16px] font-bold">전체 역량 분석</h1>

      <div className="my-4 grid grid-cols-[3fr_1fr] gap-4">
        {hexagon && <HexagonPdfSection data={hexagon} />}
        {progress && <ProgressPdfSection data={progress} />}
      </div>
      <div className="flex justify-center">
        <img src="/images/skillDescription.png" alt="역량 설명" />
      </div>
    </div>
  );
};

export default ScorePdfSection;
