"use client";
import { PlusCircle } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { useRouter } from "next/navigation";

const EmptyProjectCard = () => {
  const router = useRouter();
  return (
    <Card
      className="flex h-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-violet-200 bg-violet-50 px-4 py-6 drop-shadow-lg transition-colors hover:border-violet-300"
      onClick={() => router.push("/project/create")}
    >
      <PlusCircle className="h-12 w-12 text-violet-300" strokeWidth={1.5} />
      <span className="mt-2 text-sm text-violet-400">새 프로젝트 추가하기</span>
    </Card>
  );
};

export default EmptyProjectCard;
