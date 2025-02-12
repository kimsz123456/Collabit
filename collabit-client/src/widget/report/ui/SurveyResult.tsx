import PostCarouselSection from "@/features/community/ui/PostCarouselSection";
import useReport from "@/features/report/api/useReport";
import AISummarySection from "@/features/report/ui/AISummarySection";
import CloudSection from "@/features/report/ui/CloudSection";
import HexagonSection from "@/features/report/ui/HexagonSection";
import HistoryRateSection from "@/features/report/ui/HistoryRateSection";
import ProgressSection from "@/features/report/ui/ProgressSection";

const SurveyResult = () => {
  const { hexagon, progress, wordCloud, aiSummary, timeline } = useReport();

  return (
    <div className="flex flex-col gap-10 py-4">
      {hexagon && <HexagonSection data={hexagon} type="report" />}
      {progress && <ProgressSection data={progress} />}

      {wordCloud && (
        <CloudSection
          strength={wordCloud?.strength}
          weakness={wordCloud?.weakness}
        />
      )}

      {aiSummary && (
        <AISummarySection
          strength={aiSummary.strength}
          weakness={aiSummary.weakness}
        />
      )}
      {timeline && (
        <HistoryRateSection
          timeline={timeline.timeline}
          minScore={timeline.minScore}
          maxScore={timeline.maxScore}
        />
      )}
      <PostCarouselSection type="recommend" />
    </div>
  );
};

export default SurveyResult;
