import WordCloud from "@/entities/chart/ui/WordCloud";
import ReportTitle from "@/entities/report/ui/ReportTitle";
import { WordCloudResponse } from "@/shared/types/response/report";

const CloudSection = ({ strength, weakness }: WordCloudResponse) => {
  return (
    <div className="flex flex-col gap-4">
      <ReportTitle title="단어분석" />
      <div className="flex h-[520px] flex-col justify-center gap-4 md:h-[240px] md:flex-row">
        <div className="w-full">
          <h3 className="p-5 text-center text-lg font-semibold text-gray-700">
            긍정어
          </h3>
          <WordCloud words={strength} type="strength" />
        </div>
        <div className="w-full">
          <h3 className="p-5 text-center text-lg font-semibold text-gray-700">
            부정어
          </h3>
          <WordCloud words={weakness} type="weakness" />
        </div>
      </div>
    </div>
  );
};

export default CloudSection;
