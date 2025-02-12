"use client";

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import ReportPDFHeader from "@/entities/report/ui/ReportPDFHeader";
import useReport from "@/features/report/api/useReport";
import ScorePdfSection from "@/features/pdf/ui/ScorePdfSection";

function ReportPDF() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { report } = useReport();

  // ✅ 실시간 PDF 미리보기 업데이트 함수
  const updatePreviewPDF = () => {
    const element = contentRef.current;
    if (!element) return;

    const options = {
      filename: "report.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        backgroundColor: null,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "css" },
    };

    html2pdf()
      .set(options)
      .from(element)
      .output("bloburi") // ✅ PDF를 Blob URL로 변환
      .then((pdfBlobUrl) => {
        setPdfUrl(pdfBlobUrl); // ✅ Blob URL을 상태에 저장 → iframe에서 미리보기 가능
      });
  };

  // ✅ report가 변경될 때마다 자동으로 미리보기 업데이트
  // useEffect(() => {
  //   updatePreviewPDF();
  // }, [report]);

  return (
    <div className="flex flex-col gap-4 bg-[#f8f8f8] p-5">
      <button
        onClick={updatePreviewPDF}
        className="cursor-pointer rounded bg-[#0070f3] px-4 py-2 text-white"
      >
        미리보기 업데이트
      </button>

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="h-[500px] w-full rounded-lg border border-gray-300 shadow"
        />
      )}

      <div
        ref={contentRef}
        className="mx-auto h-[297mm] w-[210mm] bg-white p-10"
      >
        <ReportPDFHeader />
        {report?.hexagon && report?.progress && (
          <ScorePdfSection
            hexagon={report?.hexagon}
            progress={report?.progress}
          />
        )}
      </div>
    </div>
  );
}

export default ReportPDF;
