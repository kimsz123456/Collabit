import ProgressChart from "@/entities/chart/ui/ProgressChart";
import { SkillData } from "@/shared/types/response/report";

const ProgressPdfSection = ({ data }: { data: SkillData }) => {
  return (
    <div className="flex flex-col items-center justify-start gap-4 bg-white">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            <div className="mb-2 flex h-[4mm] w-[20mm] items-center justify-start">
              <img
                src={`/images/badge/${key}.png`}
                alt={key}
                className="h-full"
              />
            </div>
            <span className="w-[20mm] rounded-lg text-right text-[8px]">
              상위 {100 - value.score}%
            </span>
          </div>
          <ProgressChart value={value.score} className="w-[100%]" />
        </div>
      ))}
    </div>
  );
};

export default ProgressPdfSection;
