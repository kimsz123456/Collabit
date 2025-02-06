"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface ZingChartProps {
  width: string;
  height: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  output: string;
}

const ZingChart = dynamic(() => import("zingchart-react"), {
  ssr: false,
}) as React.ComponentType<ZingChartProps>;
export type WordCloudData = { text: string; weight: number }[];

interface WordCloudProps {
  words: WordCloudData;
  type: "positive" | "negative";
}

const WordCloud = ({ words, type }: WordCloudProps) => {
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    const loadZingChart = async () => {
      // 순서대로 모듈 로드
      await import("zingchart/es6");
      await import("zingchart/modules-es6/zingchart-wordcloud.min.js");
      setIsClientLoaded(true);
    };

    loadZingChart();
  }, []);

  if (!isClientLoaded) {
    return null; // 또는 로딩 컴포넌트
  }

  const colors = {
    positive: [
      "#64B5F6", // Light Blue
      "#42A5F5", // Sky Blue
      "#2196F3", // Blue
      "#1E88E5", // Medium Blue
      "#1976D2", // Dark Blue
      "#90CAF9", // Light Sky Blue
      "#BBDEFB", // Light Blue (Soft)
      "#E1F5FE", // Very Light Blue
      "#B3E5FC", // Pale Blue
    ],
    negative: [
      // Violet (키컬러)
      "#E57373", // Light Red
      "#EF5350", // Red
      "#F44336", // Bright Red
      "#D32F2F", // Dark Red
      "#C62828", // Deep Red
      "#FF8A80", // Soft Red
      "#FF5252", // Vivid Red
      "#FF1744", // Bright Pinkish Red
      "#FFCDD2",
    ], // Soft Pink],
  };
  const chartData = {
    type: "wordcloud",
    options: {
      words: words.map((word) => ({
        text: word.text,
        weight: word.weight,
        fontSize: `${word.weight * 0.3}vw`,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
      })),
    },
  };
  return (
    <div className="h-[200px] w-full rounded border">
      <ZingChart width="100%" height="100%" data={chartData} output="svg" />
    </div>
  );
};

export default WordCloud;
