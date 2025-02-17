"use client";

import { useAuth } from "@/features/auth/api/useAuth";
import { SurveyListProvider } from "@/features/survey/context/SurveyListProvider";
import { getSurveyDetailAPI, getSurveyListAPI } from "@/shared/api/survey";
import { useSurveyStore } from "@/shared/lib/stores/surveyStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const SurveyLayout = ({
  list,
  room,
}: {
  list: React.ReactNode;
  room: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { userInfo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const id = useSurveyStore((state) => state.id);
  const setSurveyDetail = useSurveyStore((state) => state.setSurveyDetail);
  const setSurveyEssayResponse = useSurveyStore(
    (state) => state.setSurveyEssayResponse,
  );
  const setSurveyMultipleResponse = useSurveyStore(
    (state) => state.setSurveyMultipleResponse,
  );
  const isChatRoom =
    (pathname.includes("/chat/") && pathname !== "/chat") ||
    (pathname.includes("/survey/") && pathname !== "/survey");

  // <상태관리 전략>
  // 리스트는 ContextAPI로 관리
  // 디테일은 Zustand로 관리

  // 로그인 체크
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, id]);

  // 리스트 렌더링 쿼리
  const { data } = useQuery({
    queryKey: ["surveyList", userInfo?.nickname],
    queryFn: getSurveyListAPI,
    enabled: !!userInfo?.nickname,
  });

  // 디테일 렌더링 쿼리
  const { data: surveyDetail } = useQuery({
    queryKey: ["surveyDetail", userInfo?.nickname, id],
    queryFn: () => getSurveyDetailAPI(id!),
    enabled: !!userInfo?.nickname && !!id, // id가 없으면 쿼리가 안돌아가게 하기
  });

  // 디테일 스토어 업데이트
  useEffect(() => {
    if (surveyDetail) {
      const detail = {
        nickname: surveyDetail.nickname,
        profileImage: surveyDetail.profileImage,
        title: surveyDetail.title,
      };

      setSurveyDetail(detail);
      setSurveyEssayResponse(surveyDetail.surveyEssayResponse?.messages);
      setSurveyMultipleResponse(surveyDetail.surveyMultipleResponse?.scores);
    }
  }, [
    id,
    surveyDetail,
    setSurveyDetail,
    setSurveyEssayResponse,
    setSurveyMultipleResponse,
  ]);

  // 리스트 렌더링 타입가드
  if (!data) return null;
  return (
    <SurveyListProvider initialData={data!}>
      {/* 모바일 레이아웃 */}
      <div className="md:hidden">{isChatRoom ? room : list}</div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden w-full border-b border-gray-200 md:flex">
        <div className="w-1/4 min-w-[280px] border-r">{list}</div>
        <div className="w-3/4">{room}</div>
      </div>
    </SurveyListProvider>
  );
};

export default SurveyLayout;
