"use client";

import useReport from "@/features/report/api/useReport";

const ReportPDFHeader = () => {
  const { reportInfo } = useReport();

  return (
    <div className="flex justify-between border-b py-2">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">
          <span className="text-2xl text-violet-500">
            {reportInfo?.nickname}
          </span>
          님의 협업 역량 리포트
        </h1>
        <span className="flex justify-center gap-2 rounded-md bg-violet-50 p-1 text-xs">
          <span className="font-semibold">참여인원 </span>
          <span className="font-semibold text-violet-500">
            {reportInfo?.participant}명
          </span>
          <span className="font-semibold">프로젝트 </span>
          <span className="font-semibold text-violet-500">
            {reportInfo?.project}회
          </span>
        </span>
      </div>
    </div>
  );
};

export default ReportPDFHeader;
