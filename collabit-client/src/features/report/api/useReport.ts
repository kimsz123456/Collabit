import {
  getPortfolioAISummaryAPI,
  getPortfolioChartAPI,
  getPortfolioInfoAPI,
  getPortfolioStatusAPI,
  getPortfolioTimelineChartAPI,
  getPortfolioWordCloudAPI,
} from "@/shared/api/report";
import {
  AISummaryResponse,
  ChartResponse,
  ReportInfoResponse,
  ReportStatusResponse,
  TimelineResponse,
  WordCloudResponse,
} from "@/shared/types/response/report";
import { useQuery } from "@tanstack/react-query";

const useReport = () => {
  const { data: reportStatus, isLoading: reportStatusLoading } = useQuery<
    ReportStatusResponse,
    Error
  >({
    queryKey: ["reportStatus"],
    queryFn: () => getPortfolioStatusAPI(),
  });

  const { data: reportInfo } = useQuery<ReportInfoResponse, Error>({
    queryKey: ["reportInfo"],
    queryFn: () => getPortfolioInfoAPI(),
    enabled: !!reportStatus?.exist,
  });

  const { data: report } = useQuery<ChartResponse, Error>({
    queryKey: ["report"],
    queryFn: () => getPortfolioChartAPI(),
    enabled: !!reportStatus?.exist,
  });

  const { data: wordCloud } = useQuery<WordCloudResponse, Error>({
    queryKey: ["wordCloud"],
    queryFn: () => getPortfolioWordCloudAPI(),
    enabled: !!reportStatus?.exist,
  });

  const { data: summary } = useQuery<AISummaryResponse, Error>({
    queryKey: ["summary"],
    queryFn: () => getPortfolioAISummaryAPI(),
    enabled: !!reportStatus?.exist,
  });

  const { data: timeline } = useQuery<TimelineResponse, Error>({
    queryKey: ["timeline"],
    queryFn: () => getPortfolioTimelineChartAPI(),
    enabled: !!reportStatus?.exist,
  });

  return {
    reportStatusLoading,
    reportStatus,
    reportInfo,
    report,
    wordCloud,
    summary,
    timeline,
  };
};

export default useReport;
