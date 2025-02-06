"use client";
import { useToast } from "@/shared/hooks/use-toast";
import { useState } from "react";

import NoReport from "@/entities/report/ui/NoReport";
import ReportHeader from "@/entities/report/ui/ReportHeader";
import { useAuth } from "@/features/auth/api/useAuth";
import AISummarySection from "@/features/report/ui/AISummarySection";
import CloudSection from "@/features/report/ui/CloudSection";
import CompareSection from "@/features/report/ui/CompareSection";
import ScoreAnalysisSection from "@/features/report/ui/ScoreAnalysisSection";
import useModalStore from "@/shared/lib/stores/modalStore";
import Image from "next/image";
import HistoryRateSection from "@/features/report/ui/HistoryRateSection";

export default function Page() {
  const { toast } = useToast();
  const { openModal, closeModal } = useModalStore();
  const { userInfo } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  console.log(loading);

  const handleGenerateReport = async () => {
    setLoading(true);
    openModal(<LoadingModal context="AI가 리포트를 생성하고 있어요." />);
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setReportData(mockData);
      toast({
        title: "리포트가 생성되었습니다!",
        description: "최신 결과를 확인하세요.",
      });
      closeModal();
    } catch {
      toast({ title: "오류 발생", description: "리포트 생성에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <NoReport
        handleGenerateReport={handleGenerateReport}
        currentCount={6} // 실제 데이터로 교체 필요
        requiredCount={5} // 실제 데이터로 교체 필요
      />
    );
  }
  return (
    <div className="mx-auto mb-20 mt-5 w-full p-4 md:max-w-5xl">
      <ReportHeader />
      <div className="flex flex-col gap-10 py-4">
        <ScoreAnalysisSection
          userInfo={userInfo!}
          chartScore={reportData.skills}
          highestSkill={reportData.highestSkill}
          lowestSkill={reportData.lowestSkill}
        />
        <CloudSection
          positive={reportData.wordCloud.positive}
          negative={reportData.wordCloud.negative}
        />

        <AISummarySection
          positive={reportData.AISummary.positive}
          negative={reportData.AISummary.negative}
        />
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <div className="flex h-[300px] w-full items-center justify-center rounded-md bg-gray-50 p-4">
            <CompareSection />
          </div>
          <div className="flex h-[300px] w-full items-center justify-center rounded-md bg-gray-50 p-4">
            <HistoryRateSection />
          </div>
        </div>
        {/* <CommunityCard post={mockData[0]} /> */}
      </div>
    </div>
  );
}

const mockData = {
  skills: {
    "공감(S)": 85,
    "경청(A)": 80,
    "표현(E)": 75,
    "문제해결(PS)": 90,
    "갈등해결(CS)": 70,
    "리더십(L)": 60,
  },
  highestSkill: {
    name: "문제해결(PS)",
    description:
      "문제해결력은 업무 수행 중 발생하는 다양한 문제 상황을 체계적으로 분석하고, 효율적인 해결방안을 도출하여 실행하는 능력을 평가하는 지표입니다.",
    aiComment: "상대방의 의견을 잘 듣고 이해하는 능력이 뛰어납니다.",
  },
  lowestSkill: {
    name: "리더십(L)",
    description:
      "리더십은 팀원들과의 효과적인 소통을 통해 공동의 목표를 달성하고, 팀원 개개인의 성장을 지원하며, 건설적인 피드백을 제공하는 능력을 평가하는 지표입니다.",
    aiComment:
      "팀원들과의 효과적인 소통을 통해 공동의 목표를 달성하고, 팀원 개개인의 성장을 지원하며, 건설적인 피드백을 제공하는 능력이 필요합니다.",
  },
  wordCloud: {
    positive: [
      { text: "협력", weight: 80 },
      { text: "소통", weight: 70 },
      { text: "신뢰", weight: 60 },
      { text: "팀워크", weight: 90 },
      { text: "적극성", weight: 50 },
      { text: "창의성", weight: 55 },
      { text: "유연성", weight: 40 },
      { text: "존중", weight: 100 },
      { text: "배려", weight: 85 },
      { text: "의사소통", weight: 75 },
      { text: "협업", weight: 95 },
      { text: "조화", weight: 50 },
      { text: "지원", weight: 60 },
      { text: "동기부여", weight: 65 },
    ],
    negative: [
      { text: "갈등", weight: 80 },
      { text: "오해", weight: 70 },
      { text: "불만", weight: 75 },
      { text: "소외", weight: 60 },
      { text: "부정적", weight: 65 },
      { text: "비협조", weight: 70 },
      { text: "무관심", weight: 50 },
      { text: "경쟁", weight: 75 },
      { text: "혼란", weight: 60 },
      { text: "소통 부족", weight: 80 },
      { text: "불신", weight: 70 },
      { text: "압박감", weight: 65 },
      { text: "갈등 상황", weight: 75 },
    ],
  },
  AISummary: {
    positive:
      '팀원들의 주관식 응답을 분석한 결과, 크게 세 가지 주요 의견이 도출되었습니다. 첫째, 의사소통 방식에 있어 정기적인 팀 미팅과 1:1 면담이 긍정적인 영향을 미쳤다는 의견이 다수였습니다. 특히 "어려운 이야기도 편하게 할 수 있는 분위기"가 형성되어 있다는 평가가 많았습니다. 둘째, 업무 프로세스 측면에서는 명확한 목표 설정과 체계적인 일정 관리가 팀의 강점으로 꼽혔습니다. 다만, 일부 팀원들은 업무 우선순위 설정에 대한 보다 구체적인 가이드라인이 필요하다고 제안했습니다. 마지막으로, 기술적 역량 강화를 위한 스터디 문화와 코드 리뷰 시스템이 잘 정착되어 있다는 평가가 있었으며, 이는 팀원들의 성장에 큰 도움이 되고 있다고 합니다.',
    negative:
      // ... existing code ...
      '팀원들의 주관식 응답을 분석한 결과, 개선이 필요한 몇 가지 의견들이 수집되었습니다. 첫째, 의사소통 방식에 있어 회의 시간이 다소 길어지는 경향이 있으며, "의견 제시 후 피드백을 받기까지 시간이 오래 걸린다"는 의견이 있었습니다. 둘째, 업무 프로세스 측면에서는 업무 우선순위 설정이 때때로 불명확하여 일정 관리에 어려움을 겪는다는 의견이 있었습니다. 특히 급한 업무가 갑자기 추가될 때 기존 일정 조정이 원활하지 않다는 점이 지적되었습니다. 마지막으로, 기술 스택 학습을 위한 시간이 충분히 확보되지 않는다는 의견이 있었으며, 팀 내 기술 공유 세션의 횟수를 늘리면 좋겠다는 건설적인 제안이 있었습니다. 이러한 피드백들은 대체로 현재 잘 운영되고 있는 시스템을 더욱 개선하기 위한 제안사항들로 보입니다.',
    // ... existing code ...
  },
};

const LoadingModal = ({ context }: { context: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 어두운 오버레이 배경 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 로딩 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center rounded-lg">
        <Image
          src={"/images/logo-lg.png"}
          alt="loading"
          width={100}
          height={100}
          className="animate-custom-pulse"
        />
        <span className="mt-4 flex text-2xl font-bold text-gray-300">
          <p className="relative">{context}</p>
        </span>
      </div>
    </div>
  );
};
