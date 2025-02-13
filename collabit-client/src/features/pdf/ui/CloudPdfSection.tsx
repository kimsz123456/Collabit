import WordCloudPdf from "@/entities/chart/ui/WordCloudPdf";
import { WordCloudResponse } from "@/shared/types/response/report";

const CloudSection = ({ strength, weakness }: WordCloudResponse) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-[16px] font-bold">단어 분석</h1>
      <div className="flex h-[200px] flex-row justify-center gap-4">
        <div className="w-full">
          <h3 className="text-center text-[12px] font-semibold mb-4 text-gray-700">
            긍정어
          </h3>
          <WordCloudPdf words={strength} type="strength" />
        </div>
        <div className="w-full">
          <h3 className="text-center text-[12px] font-semibold mb-4 text-gray-700">
            부정어
          </h3>
          <WordCloudPdf words={weakness} type="weakness" />
        </div>
      </div>
    </div>
  );
};

export default CloudSection;
