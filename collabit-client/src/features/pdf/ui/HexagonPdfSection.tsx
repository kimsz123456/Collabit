import HexagonPdfChart from "@/entities/chart/ui/HexagonPdfChart";
import { ChartRangeData, SkillData } from "@/shared/types/response/report";

const HexagonPdfSection = ({ data }: { data: ChartRangeData & SkillData }) => {
  const {
    listening,
    sympathy,
    expression,
    conflictResolution,
    problemSolving,
    leadership,
  } = data;

  const hexagonItems = [
    { key: "sympathy", ...sympathy, position: "col-start-1 row-start-1" },

    {
      key: "listening",
      ...listening,
      position: "col-start-3 row-start-1",
    },

    { key: "expression", ...expression, position: "col-start-3 row-start-2" },
    {
      key: "problemSolving",
      ...problemSolving,
      position: "col-start-3 row-start-3",
    },
    {
      key: "conflictResolution",
      ...conflictResolution,
      position: "col-start-1 row-start-3",
    },

    {
      key: "leadership",
      ...leadership,
      position: "col-start-1 row-start-2",
    },
  ];

  return (
    <div>
      <div className="m-auto grid grid-cols-3 grid-rows-3 place-items-center items-center justify-center gap-4">
        {/* 중앙 Chart */}
        <div className="col-start-2 row-span-3 row-start-1 flex items-center justify-center pr-4">
          <div className="h-[50mm] w-[50mm]">
            <HexagonPdfChart hexagon={data} />
          </div>
        </div>

        {/* 역량별 피드백 */}
        {hexagonItems.map(({ key, feedback, position }) => (
          <div
            key={key}
            className={`text-center text-sm text-gray-600 ${position} m-auto`}
          >
            <div className="mb-2 flex h-[4mm] w-[20mm] items-center justify-start">
              <img
                src={`/images/badge/${key}.png`}
                alt={key}
                className="h-full"
              />
            </div>
            {feedback && (
              <span className="text-balance block text-[8px] leading-tight">
                {feedback}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagonPdfSection;
