"use client";

import { getAddedProjectAPI, createProjectAPI } from "@/shared/api/project";
import { ProjectCreateRequest } from "@/shared/types/request/project";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ProjectAddedResponse } from "@/shared/types/response/project";
import TwoButtonModal from "@/widget/ui/modals/TwoButtonModal";
import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { useRouter } from "next/navigation";

export const useCreateProject = (org: string, title: string) => {
  const queryClient = useQueryClient();
  const [isAdded, setIsAdded] = useState(false);
  const { openModal, closeModal } = useModalStore();
  const router = useRouter();

  // 등록된 프로젝트 정보 가져오기
  const { data: addedProjects, isLoading: isAddedLoading } = useQuery<
    ProjectAddedResponse[]
  >({
    queryKey: ["addedProjects"],
    queryFn: getAddedProjectAPI,
  });

  // 등록 여부 확인
  useEffect(() => {
    const projectArray = Array.isArray(addedProjects) ? addedProjects : [];
    setIsAdded(
      projectArray.some(
        (project) => project.organization === org && project.title === title,
      ),
    );
  }, [addedProjects, org, title]);

  // 프로젝트 생성 Mutation
  const createProjectMutation = useMutation({
    mutationFn: createProjectAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addedProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      openModal(
        <OneButtonModal
          title="프로젝트 등록 성공"
          description="프로젝트가 등록되었습니다."
          buttonText="확인"
          handleButtonClick={() => closeModal()}
        />,
      );
    },
    onError: (error) => console.error("프로젝트 생성 실패:", error),
  });

  const handleAddProject = (project: ProjectCreateRequest) => {
    if (isAdded) {
      openModal(
        <OneButtonModal
          title="프로젝트 등록 실패"
          description="이미 등록된 프로젝트입니다."
          buttonText="확인"
          handleButtonClick={() => closeModal()}
        />,
      );
      return;
    }

    if (project.contributors.length < 2) {
      openModal(
        <OneButtonModal
          title="프로젝트 등록 실패"
          description="최소 2명 이상의 참여자가 필요합니다."
          buttonText="확인"
          handleButtonClick={() => closeModal()}
        />,
      );
      return;
    }

    openModal(
      <TwoButtonModal
        title="프로젝트 등록"
        description="이 프로젝트를 등록하시겠습니까?"
        confirmText="등록"
        cancelText="취소"
        handleConfirm={() => handleCreateProject(project)}
      />,
    );
  };

  const handleCreateProject = async (project: ProjectCreateRequest) => {
    await createProjectMutation.mutateAsync(project);
    router.push(
      `/project/create?keyword=${project.organization}&repo=${project.title}`,
    );
  };

  return {
    isLoading: isAddedLoading,
    isAdded,
    handleAddProject,
    addedProjects,
  };
};
