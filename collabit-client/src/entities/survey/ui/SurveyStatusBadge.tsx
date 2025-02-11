import { cn } from "@/shared/lib/shadcn/utils";

const SurveyStatusBadge = ({ status }: { status: number }) => {
  return (
    <span
      className={cn(
        "flex h-6 items-center justify-center text-nowrap rounded-full px-2 text-[10px] font-bold text-white shadow-md",
        {
          "border-rose-600 bg-rose-500": status === 0,
          "border-emerald-600 bg-emerald-500": status === 1,
          "border-gray-500 bg-gray-400": status === 2,
        },
      )}
    >
      {status === 0 && "NEW"}
      {status === 1 && "진행중"}
      {status === 2 && "완료"}
    </span>
  );
};

export default SurveyStatusBadge;
