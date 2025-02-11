"use client";
import { useToast } from "@/shared/hooks/use-toast";
import { useState } from "react";

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

export default function Page() {
  const { toast } = useToast();
  const { openModal, closeModal } = useModalStore();

  const { reportStatus, reportStatusLoading } = useReport();

  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    openModal(
      loading && (
        <ReportLoadingModal context="AI가 리포트를 생성하고 있어요." />
      ),
    );
    try {
      const springResponse = await createPortfolioSpringAPI();
      const flaskResponse = await createPortfolioFlaskAPI();

      if (springResponse.ok && flaskResponse.ok) {
        toast({
          title: "리포트가 생성되었습니다!",
          description: "최신 결과를 확인하세요.",
        });
        closeModal();
      } else {
        throw new Error("리포트 생성에 실패했습니다.");
      }
    } catch {
      toast({ title: "오류 발생", description: "리포트 생성에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  if (reportStatusLoading) {
    return <ReportLoadingModal context="리포트 상태를 불러오는 중입니다..." />;
  }

  if (!reportStatus?.exist) {
    return (
      <NoReport
        handleGenerateReport={handleGenerateReport}
        currentCount={reportStatus?.totalParticipant ?? 0}
        requiredCount={Number(process.env.NEXT_MINIMUM_CREATE_CONDITION)}
      />
    );
  }

  return (
    <div className="mx-auto mb-20 mt-5 w-full p-4 md:max-w-5xl">
      <ReportHeader />
      {reportStatus && <SurveyResult />}
    </div>
  );
}
