import PostCarouselSection from "@/features/community/ui/PostCarouselSection";
import useReport from "@/features/report/api/useReport";
import AISummarySection from "@/features/report/ui/AISummarySection";
import CloudSection from "@/features/report/ui/CloudSection";
import HexagonSection from "@/features/report/ui/HexagonSection";
import HistoryRateSection from "@/features/report/ui/HistoryRateSection";
import ProgressSection from "@/features/report/ui/ProgressSection";

const SurveyResult = () => {
  const { report, wordCloud, summary, timeline } = useReport();

  return (
    <div className="flex flex-col gap-10 py-4">
      {report && <HexagonSection data={report.hexagon} type="report" />}
      {report && <ProgressSection data={report.progress} />}

      {wordCloud && (
        <CloudSection
          strength={wordCloud?.strength}
          weakness={wordCloud?.weakness}
        />
      )}

      {summary && (
        <AISummarySection
          strength={summary.strength}
          weakness={summary.weakness}
        />
      )}
      {timeline && <HistoryRateSection history={timeline} />}
      <PostCarouselSection type="recommend" />
    </div>
  );
};

export default SurveyResult;
