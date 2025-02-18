"use client";

import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="m-auto flex min-h-[calc(100vh-200px)] max-w-5xl flex-col items-center justify-center gap-6 py-5 md:py-10">
      <h1 className="animate-pulse bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-4xl font-black text-transparent">
        404
      </h1>
      <Image src="/images/chatbot.png" alt="404" width={200} height={200} />
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-gray-600">
          <span className="mb-2 block text-xl font-semibold">
            페이지를 찾을 수 없습니다
          </span>
          요청하신 페이지가 삭제되었거나 잘못된 경로입니다
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-600/90"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFound;
