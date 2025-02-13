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


const formatProjectName = (name: string): string[] => {
  const maxCharsPerLine = 10;
  if (name.length <= maxCharsPerLine) return [name];

  const firstLine = name.slice(0, maxCharsPerLine);
  const remaining = name.slice(maxCharsPerLine);

  if (remaining.length <= maxCharsPerLine) {
    return [firstLine, remaining];
  } else {
    // 두 번째 줄이 10글자보다 길 경우, 남은 글자 중 7글자만 표시하고 "..." 추가
    const secondLine = remaining.slice(0, maxCharsPerLine - 3) + "...";
    return [firstLine, secondLine];
  }
};

interface HistoryRateSectionProps {
  history: TimelineResponse;
}

const HistoryRateSection = ({ history }: HistoryRateSectionProps) => {
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

  // 기존에는 라벨을 문자열로 처리했지만, 이제 각 프로젝트명을 문자열 배열로 처리합니다.
  // 중복 제거를 위해 우선 join("\n")한 값으로 Set에 넣은 후 다시 split("\n")으로 배열로 복원합니다.
  const uniqueLabels = Array.from(
    new Set(
      timeline.map((project) =>
        formatProjectName(project.projectName).join("\n"),
      ),
    ),
  ).map((label) => label.split("\n"));

  const data = {
    labels: uniqueLabels,
    datasets: Object.keys(timeline[0])
      .filter(
        (key) =>
          key !== "projectName" &&
          key !== "organization" &&
          key !== "completedAt",
      )
      .map((key) => ({
        label: (timeline[0][key] as keyof SkillData as unknown as Skill).name,
        data: timeline.map(
          (project) =>
            (project[key] as keyof SkillData as unknown as Skill)?.score ||
            null,
        ),
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

export default HistoryRateSection;
