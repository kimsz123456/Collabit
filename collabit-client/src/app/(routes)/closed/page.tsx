"use client";

import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { useEffect } from "react";

const Page = () => {
  const { openModal, closeModal } = useModalStore();
  useEffect(() => {
    openModal(
      <OneButtonModal
        title="종료된 설문입니다."
        description="설문 요청자가 이미 설문을 종료했습니다."
        buttonText="홈으로"
        handleButtonClick={() => {
          closeModal();
          window.location.href = "/";
        }}
      />,
    );
  }, []);
  return <></>;
};

export default Page;
