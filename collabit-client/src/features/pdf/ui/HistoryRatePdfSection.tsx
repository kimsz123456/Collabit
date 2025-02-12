import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Skill,
  SkillData,
  TimelineResponse,
} from "@/shared/types/response/report";
import ReportTitle from "@/entities/report/ui/ReportTitle";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface HistoryRatePdfSectionProps {
  history: TimelineResponse;
}

const HistoryRatePdfSection = ({ history }: HistoryRatePdfSectionProps) => {
  const timeline = history.timeline;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        min: history.minScore,
        max: history.maxScore,
      },
    },
  };

  const skillColors = {
    sympathy: "rgb(255, 99, 132)",
    listening: "rgb(54, 162, 235)",
    expression: "rgb(75, 192, 192)",
    problemSolving: "rgb(255, 206, 86)",
    conflictResolution: "rgb(153, 102, 255)",
    leadership: "rgb(255, 159, 64)",
  };

  const data = {
    labels: [...new Set(timeline.map((project) => project.projectName))],
    datasets: Object.keys(timeline[0])
      .filter(
        (key) =>
          key !== "projectName" &&
          key !== "organization" &&
          key !== "completedAt",
      )
      .map((key) => ({
        label: (timeline[0][key] as keyof SkillData as unknown as Skill).name,
        data: [
          ...timeline.map(
            (project) =>
              (project[key] as keyof SkillData as unknown as Skill)?.score ||
              null,
          ),
        ],
        borderColor: skillColors[key] || "gray",
        backgroundColor: skillColors[key] || "gray",
        tension: 0.3,
        spanGaps: true,
      })),
  };

  if (!timeline || timeline.length === 0) {
    return <p className="text-center text-gray-500">데이터가 없습니다.</p>;
  }

  return (
    <div className="h-full w-full">
      <ReportTitle title="역량 변화 추이" />
      <Line options={options} data={data} />
    </div>
  );
};

export default HistoryRatePdfSection;
