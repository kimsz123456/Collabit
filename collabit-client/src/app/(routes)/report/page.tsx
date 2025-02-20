"use client";
import { useToast } from "@/shared/hooks/use-toast";
import { useEffect, useState } from "react";

import NoReport from "@/entities/report/ui/NoReport";
import ReportHeader from "@/entities/report/ui/ReportHeader";
import useModalStore from "@/shared/lib/stores/modalStore";
import useReport from "@/features/report/api/useReport";
import {
  createPortfolioFlaskAPI,
  createPortfolioSpringAPI,
} from "@/shared/api/report";
import { ReportLoadingModal } from "@/entities/report/ui/ReportLoadingModal";
import SurveyResult from "@/widget/report/ui/SurveyResult";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const { toast } = useToast();
  const { openModal, closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const { reportStatus, reportStatusLoading, report } = useReport();
  const [isExist, setIsExist] = useState(reportStatus?.exist);

  useEffect(() => {
    if (reportStatus?.exist) {
      setIsExist(true);
    }
  }, [reportStatus]);

  const handleGenerateReport = async () => {
    openModal(<ReportLoadingModal context="AI가 리포트를 생성하고 있어요." />);

    try {
      const responses = await Promise.allSettled([
        createPortfolioSpringAPI(),
        createPortfolioFlaskAPI(),
      ]);

      const isSuccess = responses.some((res) => res.status === "fulfilled");

      if (isSuccess) {
        toast({
          title: "리포트가 생성되었습니다!",
          description: "최신 결과를 확인하세요.",
        });
      } else {
        throw new Error("리포트 생성 실패");
      }
      await queryClient.refetchQueries({ queryKey: ["reportStatus"] });
      await queryClient.refetchQueries({ queryKey: ["report"] });
      setIsExist(reportStatus?.exist ?? false);
      closeModal();
    } catch {
      toast({ title: "오류 발생", description: "리포트 생성에 실패했습니다." });
      closeModal();
    }
  };

  if (reportStatusLoading) {
    return <ReportLoadingModal context="리포트 상태를 불러오는 중입니다..." />;
  }

  return (
    <div className="mx-auto mb-20 mt-5 w-full p-4 md:max-w-5xl">
      {isExist && reportStatus ? (
        <>
          <ReportHeader handleRefresh={handleGenerateReport} />
          {report && (
            <SurveyResult
              hexagon={report?.hexagon}
              progress={report?.progress}
              wordCloud={report?.wordCloud}
              aiSummary={report?.aiSummary}
              timeline={report?.timeline}
            />
          )}
        </>
      ) : (
        <NoReport
          handleGenerateReport={handleGenerateReport}
          currentCount={reportStatus?.totalParticipant ?? 0}
          requiredCount={
            isNaN(Number(process.env.NEXT_PUBLIC_MINIMUM_CREATE_CONDITION))
              ? 0
              : Number(process.env.NEXT_PUBLIC_MINIMUM_CREATE_CONDITION)
          }
        />
      )}
    </div>
  );
}
