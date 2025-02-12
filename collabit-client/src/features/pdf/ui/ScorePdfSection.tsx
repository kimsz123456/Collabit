import { ChartResponse } from "@/shared/types/response/report";
import HexagonPdfSection from "./HexagonPdfSection";
import ProgressPdfSection from "./ProgressPdfSection";
import Image from "next/image";

const ScorePdfSection = ({ hexagon, progress }: ChartResponse) => {
  const hexagonItems = [
    "sympathy",
    "listening",
    "expression",
    "problemSolving",
    "conflictResolution",
    "leadership",
  ];
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="m-4 text-center text-[16px] font-bold">전체 역량 분석</h1>
      <div className="grid grid-cols-6 grid-rows-1 justify-center gap-2">
        {hexagon &&
          hexagonItems.map((key) => (
            <div
              key={key}
              className={`flex h-[20mm] w-auto flex-col items-center justify-center rounded-xl bg-violet-50 p-2 text-center text-sm text-gray-600`}
            >
              <div className="mb-2 flex h-[5mm] w-auto items-center justify-center">
                <img
                  src={`/images/badge/${key}.png`}
                  alt={hexagon[key].name}
                  className="h-full w-full"
                />
              </div>
              {hexagon[key].description && (
                <p className="flex-1 text-balance text-[8px] leading-tight">
                  {hexagon[key].description}
                </p>
              )}
            </div>
          ))}
      </div>
      <div className="my-4 grid grid-cols-[3fr_1fr] gap-4">
        {hexagon && <HexagonPdfSection data={hexagon} />}
        {progress && <ProgressPdfSection data={progress} />}
      </div>
    </div>
  );
};

export default ScorePdfSection;
