import {
  getPortfolioDataAPI,
  getPortfolioShareAPI,
  getPortfolioStatusAPI,
} from "@/shared/api/report";
import {
  ChartResponse,
  ReportStatusResponse,
} from "@/shared/types/response/report";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const useReport = () => {
  const { hashedValue } = useParams();
  const { data: reportStatus, isLoading: reportStatusLoading } = useQuery<
    ReportStatusResponse,
    Error
  >({
    queryKey: ["reportStatus"],
    queryFn: () => getPortfolioStatusAPI(),
  });

  const { data: report } = useQuery<ChartResponse, Error>({
    queryKey: ["report"],
    queryFn: () => getPortfolioDataAPI(),
    enabled: !!reportStatus?.exist,
  });

  
  const fetchReportPDF = async ({
    queryKey,
  }: {
    queryKey: [string, string];
  }) => {
    const [, hashedValue] = queryKey;
    return getPortfolioShareAPI(hashedValue as string);
  };

  const { data: reportPDF } = useQuery<ChartResponse, Error>({
    queryKey: ["reportPDF", hashedValue],
    queryFn: () => fetchReportPDF({ queryKey: ["reportPDF", hashedValue] }),
    enabled: !!reportStatus?.exist && !!hashedValue,
  });

  if (!report)
    return {
      reportStatusLoading,
      reportStatus,
      reportPDF,
    };

  const { hexagon, progress, wordCloud, aiSummary, timeline, portfolioInfo } =
    report;

  return {
    reportStatusLoading,
    reportStatus,
    hexagon,
    progress,
    wordCloud,
    aiSummary,
    timeline,
    portfolioInfo,
    reportPDF,
  };
};

export default useReport;
