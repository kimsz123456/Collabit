"use client";

import CompareScoreSection from "@/features/main/CompareScoreSection";
import MyProjectSection from "@/features/main/MyProjectSection";
import { useState } from "react";
import { useEffect } from "react";
import PostCarouselSection from "@/features/community/ui/PostCarouselSection";
import useModalStore from "@/shared/lib/stores/modalStore";
import NotificationModal from "@/widget/ui/modals/NotificationModal";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { openModal, closeModal } = useModalStore();

  useEffect(() => {
    setIsMounted(true);
    openModal(
      <NotificationModal
        title="알림"
        description={`안녕하세요, Collabit 팀입니다.\n
  현재 프로젝트 및 리포트 생성 기능이 정상적으로 작동하고 있으며,\n
  커뮤니티 및 채팅 생성, 마이페이지 기능은 개발 진행 중입니다.\n
  추후 업데이트에서 반영될 예정이니 많은 기대 부탁드립니다.\n
  감사합니다!😊`}
        buttonText="확인"
        handleButtonClick={closeModal}
      />,
    );
  }, [openModal, closeModal]);

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
