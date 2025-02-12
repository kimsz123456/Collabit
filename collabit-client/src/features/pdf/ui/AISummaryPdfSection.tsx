import { AISummaryResponse } from "@/shared/types/response/report";
const AISummarySection = ({ strength, weakness }: AISummaryResponse) => {
  return (
    <div className="flex flex-col gap-4 bg-white">
      <h1 className="text-center text-[16px] font-bold">AI 강약점 요약</h1>
      <div className="flex flex-col gap-2">
        <div className="flex h-[25mm] items-center justify-center rounded-lg bg-blue-50 px-4 pb-4 text-[10px]">
          <p >{strength}</p>
        </div>
        <div className="flex h-[25mm] items-center justify-center rounded-lg bg-red-50 px-4 pb-4 text-[10px]">
          <p >{weakness}</p>
        </div>
      </div>
    </div>
  );
};
export default AISummarySection;
