"use client";

import { removeProjectAPI, updateProjectDoneAPI } from "@/shared/api/project";
import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import TwoButtonModal from "@/widget/ui/modals/TwoButtonModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProjectList = () => {
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModalStore();

  const removeProjectMutation = useMutation({
    mutationFn: removeProjectAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      closeModal();
      openModal(
        <OneButtonModal
          title="프로젝트 삭제"
          description="프로젝트가 성공적으로 삭제되었습니다."
          buttonText="확인"
          handleButtonClick={() => closeModal()}
        />,
      );
    },
  });

  const finishSurveyMutation = useMutation({
    mutationFn: updateProjectDoneAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      queryClient.refetchQueries({ queryKey: ["projectList"] });
      openModal(
        <OneButtonModal
          title="프로젝트 종료"
          description="프로젝트가 성공적으로 종료되었습니다."
          buttonText="확인"
          handleButtonClick={() => closeModal()}
        />,
      );
    },
  });

  const handleRemoveProject = (code: number, participant: number) => {
    if (participant == 0) {
      openModal(
        <TwoButtonModal
          title="프로젝트를 삭제하시겠습니까?"
          description="이 프로젝트를 삭제하면 복구할 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          handleConfirm={async () => {
            await removeProjectMutation.mutateAsync(code);
          }}
        />,
      );
    } else {
      openModal(
        <OneButtonModal
          title="프로젝트를 삭제할 수 없습니다."
          description="참여자가 존재하는 프로젝트는 삭제할 수 없습니다."
          buttonText="확인"
          handleButtonClick={closeModal}
        />,
      );
    }
  };

  const handleFinishSurvey = (code: number) => {
    openModal(
      <TwoButtonModal
        title="설문을 종료하시겠습니까?"
        description="이 프로젝트의 설문에 더이상 참여할 수 없습니다."
        confirmText="설문 종료"
        cancelText="취소"
        handleConfirm={async () => {
          await finishSurveyMutation.mutateAsync(code);
        }}
      />,
    );
  };

  return {
    handleFinishSurvey,
    handleRemoveProject,
  };
};
