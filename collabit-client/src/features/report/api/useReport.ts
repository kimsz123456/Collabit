import {
  getPortfolioDataAPI,
  getPortfolioStatusAPI,
} from "@/shared/api/report";
import {
  ChartResponse,
  ReportStatusResponse,
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

  const { data: report } = useQuery<ChartResponse, Error>({
    queryKey: ["report"],
    queryFn: () => getPortfolioDataAPI(),
    enabled: !!reportStatus?.exist,
  });

  if (!report)
    return {
      reportStatusLoading,
      reportStatus,
    };

  return {
    reportStatusLoading,
    reportStatus,
    report,
  };
};

export default useReport;
