"use client";

import CompareScoreSection from "@/features/main/CompareScoreSection";
import MyProjectSection from "@/features/main/MyProjectSection";
import { useState } from "react";

import { useEffect } from "react";
import PostCarouselSection from "@/features/community/ui/PostCarouselSection";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="m-auto flex max-w-5xl flex-col items-center gap-11 py-5 md:py-10">
      <h2 className="sr-only">
        메인페이지, 사용자 평균 협업 점수와 프로젝트 소식과 요즘 핫한 소식을
        확인하세요.
      </h2>
      <CompareScoreSection />
      <MyProjectSection />
      <PostCarouselSection type="latest" />
    </div>
  );
}
