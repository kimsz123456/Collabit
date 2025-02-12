"use client";

import useReport from "@/features/report/api/useReport";

const ReportPDFHeader = () => {
  const { reportInfo } = useReport();

  return (
    <div className="flex items-center justify-between">
      <h1 className="pb-4 text-[20px] font-bold">
        <span className="text-[28px] text-violet-500">
          {reportInfo?.nickname}
        </span>
        님의 협업 역량 종합평가
      </h1>
      <span className="flex items-center justify-center gap-2 rounded-md bg-violet-50 px-2 pb-3 text-[14px]">
        <span className="font-semibold">참여인원 </span>
        <span className="font-semibold text-violet-500">
          {reportInfo?.participant}명
        </span>
        <span className="font-semibold">프로젝트 </span>
        <span className="font-semibold text-violet-500">
          {reportInfo?.project}회
        </span>
      </span>
      <div className="flex h-[15mm] w-[15mm] items-center justify-center rounded-md bg-gray-500">
        QR
      </div>
    </div>
  );
};

export default ReportPDFHeader;
