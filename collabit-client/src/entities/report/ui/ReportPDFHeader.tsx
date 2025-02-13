"use client";

import useReport from "@/features/report/api/useReport";
import { QRCodeCanvas } from "qrcode.react";

const ReportPDFHeader = ({ shareUrl }: { shareUrl: string }) => {
  const { report } = useReport();
  const portfolioInfo = report?.portfolioInfo;

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center justify-start">
        <h1 className="pb-4 text-[18px] font-bold">
          <span className="text-[24px] text-violet-500">
            {portfolioInfo?.nickname}
          </span>
          님의 협업 역량 종합평가
        </h1>
        <span className="ml-2 mt-2 flex h-[7mm] items-center justify-center gap-2 rounded-md bg-violet-50 px-2 pb-3 text-[10px]">
          <span className="font-semibold">참여인원 </span>
          <span className="font-semibold text-violet-500">
            {portfolioInfo?.participant}명
          </span>
          <span className="font-semibold">프로젝트 </span>
          <span className="font-semibold text-violet-500">
            {portfolioInfo?.project}회
          </span>
        </span>
      </div>
      <div className="flex h-[15mm] w-[15mm] items-center justify-center rounded-md">
        {shareUrl && (
          <QRCodeCanvas
            value={shareUrl}
            size={50}
            bgColor="#ffffff"
            fgColor="#000000"
            level="L"
          />
        )}
      </div>
    </div>
  );
};

export default ReportPDFHeader;
