import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { ChartRangeData, SkillData } from "@/shared/types/response/report";

Chart.register(...registerables);

interface HexagonPdfChartProps {
  hexagon: SkillData & ChartRangeData;
}

const HexagonPdfChart = ({ hexagon }: HexagonPdfChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { minScore, maxScore, ...hexagonItem } = hexagon;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;
    const hexagonChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.values(hexagonItem).map((skill) => skill.name),
        datasets: [
          {
            label: "역량 점수",
            data: Object.values(hexagonItem).map((skill) => skill.score),
            backgroundColor: "rgba(109, 40, 217, 0.2)",
            borderColor: "#6d28d9",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: false,
            max: maxScore,
            min: minScore,
            ticks: {
              font: {
                size: 6,
              },
            },
            pointLabels: {
              font: {
                size: 6,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 6, 
              },
            },
          },
          tooltip: {
            titleFont: {
              size: 6,
            },
            bodyFont: {
              size: 6, 
            },
          },
        },
      },
    });

    return () => {
      hexagonChart.destroy();
    };
  }, [hexagonItem, minScore, maxScore]);

  return (
    <div style={{ width: "200px", height: "200px" }}> {/* ✅ 차트 크기 축소 */}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default HexagonPdfChart;
