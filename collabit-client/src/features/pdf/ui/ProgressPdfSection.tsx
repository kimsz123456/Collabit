import ProgressChart from "@/entities/chart/ui/ProgressChart";
import ReportTitle from "@/entities/report/ui/ReportTitle";
import { SkillData } from "@/shared/types/response/report";
import { Badge } from "@/shared/ui/badge";

const ProgressPdfSection = ({ data }: { data: SkillData }) => {
  return (
    <div className="flex flex-col gap-4 bg-white">
      <ReportTitle title="전체 이용자 대비 협업 능력" />
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between gap-2">
              <Badge className="bg-violet-100 text-sm text-black hover:bg-violet-300">
                {value.name}
              </Badge>
              <span className="rounded-lg text-sm">
                상위 {100 - value.score}%
              </span>
            </div>
            <ProgressChart value={value.score} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPdfSection;
