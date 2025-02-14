"use client";

import { Button } from "@/shared/ui/button";
import { ChevronsUpIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
const apiUri = process.env.NEXT_PUBLIC_API_URI;
const LoginPage = () => {

  const handleLogin = () => {
    const lastPath = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lastPath="))
      ?.split("=")[1];

    // URL 디코딩을 수행
    const decodedPath = lastPath ? decodeURIComponent(lastPath) : "/";

    sessionStorage.setItem("returnTo", decodedPath);
    window.location.href = `${apiUri}/oauth2/authorization/github`;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 py-20">
      <div className="flex flex-col items-center justify-center gap-3">
        <h2 className="text-4xl font-bold">로그인</h2>
        <p className="text-md text-center text-gray-600">
          피드백을 진행하려면
          <br /> Github 계정으로 로그인이 필요합니다.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <Image
          src="/icons/GithubDark.svg"
          alt="github"
          width={64}
          height={64}
        />
        <ChevronsUpIcon className="h-6 w-6" />
        <Image
          src="/images/logo-lg.png"
          alt="collabit"
          width={120}
          height={50}
          priority
        />
      </div>
      <Button onClick={handleLogin} className="h-12 w-full max-w-[280px]">
        Github 계정으로 로그인
      </Button>
      <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
        <p>
          아직 계정이 없으신가요?{" "}
          <Link href="/signup">
            <span className="text-violet-700">회원가입</span>
          </Link>
        </p>
        <p>
          이미 계정이 있으신가요?{" "}
          <Link href="/login/credential">
            <span className="text-violet-700">이메일 로그인</span>
          </Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
