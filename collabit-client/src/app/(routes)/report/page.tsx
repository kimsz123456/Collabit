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

  const { reportStatus, reportStatusLoading } = useReport();
  const [isExist, setIsExist] = useState(reportStatus?.exist);

  useEffect(() => {
    if (reportStatus?.exist) {
      setIsExist(true);
    }
  }, [reportStatus]);

  // ✅ 리포트 생성 함수
  const handleGenerateReport = async () => {
    openModal(<ReportLoadingModal context="AI가 리포트를 생성하고 있어요." />);

    try {
      await Promise.allSettled([
        createPortfolioSpringAPI(),
        createPortfolioFlaskAPI(),
      ]);
      toast({
        title: "리포트가 생성되었습니다!",
        description: "최신 결과를 확인하세요.",
      });

      closeModal();

      await queryClient.invalidateQueries({ queryKey: ["reportStatus"] });
      setIsExist(reportStatus?.exist);
    } catch {
      toast({ title: "오류 발생", description: "리포트 생성에 실패했습니다." });
      closeModal();
    }
  };

  // ✅ 데이터 로딩 중이면 로딩 화면 표시
  if (reportStatusLoading) {
    return <ReportLoadingModal context="리포트 상태를 불러오는 중입니다..." />;
  }

  return (
    <div className="mx-auto mb-20 mt-5 w-full p-4 md:max-w-5xl">
      {isExist && reportStatus ? (
        <>
          <ReportHeader handleRefresh={handleGenerateReport} />
          <SurveyResult />
        </>
      ) : (
        <NoReport
          handleGenerateReport={handleGenerateReport}
          currentCount={reportStatus?.totalParticipant ?? 0}
          requiredCount={Number(
            process.env.NEXT_PUBLIC_MINIMUM_CREATE_CONDITION,
          )}
        />
      )}
    </div>
  );
}
