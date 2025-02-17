import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

const EmptyMyPost = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <svg
        className="h-16 w-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">
        아직 게시글이 없습니다
      </h3>
      <p className="text-sm text-gray-500">게시물을 작성하러 가볼까요? </p>
      <Button onClick={() => router.push("/community/post")}>
        글 쓰러 가기
      </Button>
    </div>
  );
};

export default EmptyMyPost;
