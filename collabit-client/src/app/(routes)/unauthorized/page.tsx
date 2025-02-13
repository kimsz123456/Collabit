"use client";

import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { useEffect } from "react";

const Page = () => {
  const { openModal, closeModal } = useModalStore();
  useEffect(() => {
    openModal(
      <OneButtonModal
        title="권한이 없습니다."
        description="권한이 없습니다."
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
