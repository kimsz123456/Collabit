"use client";

import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import ReportPDFHeader from "@/entities/report/ui/ReportPDFHeader";
import useReport from "@/features/report/api/useReport";
import HexagonPdfSection from "@/features/pdf/ui/HexagonPdfSection";
import ProgressPdfSection from "@/features/pdf/ui/ProgressPdfSection";
import AISummaryPdfSection from "@/features/pdf/ui/AISummaryPdfSection";
import CloudPdfSection from "@/features/pdf/ui/CloudPdfSection";
import HistoryRatePdfSection from "@/features/pdf/ui/HistoryRatePdfSection";

// PDF 다운로드 및 렌더링하는 메인 컴포넌트
function ReportPDF() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { report, wordCloud, summary, timeline } = useReport();

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    if (!element) return;

    // A4 사이즈(pdf)는 기본적으로 210 x 297 mm (세로 방향)입니다.
    const options = {
      margin: 0,
      filename: "report.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3, // ✅ 해상도 높이기
        useCORS: true, // ✅ 외부 폰트 지원
        logging: false,
        letterRendering: true, // ✅ 폰트, 줄 간격 보존
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" }, // ✅ 페이지 깨짐 방지
    };

    // html2pdf로 PDF 생성 및 저장
    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="bg-[#f8f8f8] p-5">
      <button
        onClick={handleDownloadPDF}
        className="mb-5 cursor-pointer rounded bg-[#0070f3] px-4 py-2 text-white"
      >
        PDF 다운로드
      </button>
      {/* 아래 div가 PDF로 변환될 A4 사이즈 영역입니다. */}
      <div
        ref={contentRef}
        className="mx-auto h-[297mm] w-[210mm] bg-white p-4"
      >
        <ReportPDFHeader />
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {report && <HexagonPdfSection data={report.hexagon} type="report" />}
          {report && <ProgressPdfSection data={report.progress} />}
        </div>
        {wordCloud && (
          <CloudPdfSection
            strength={wordCloud?.strength}
            weakness={wordCloud?.weakness}
          />
        )}
        {summary && (
          <AISummaryPdfSection
            strength={summary.strength}
            weakness={summary.weakness}
          />
        )}
        {timeline && <HistoryRatePdfSection history={timeline} />}
      </div>
    </div>
  );
}

export default ReportPDF;
