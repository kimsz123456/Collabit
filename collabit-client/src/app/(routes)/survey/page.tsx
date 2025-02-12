"use client";

import SurveyList from "@/features/survey/ui/refactor/SurveyList";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import EmptySurveyPage from "@/widget/survey/EmptySurveyPage";

const ListPage = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isDesktop ? (
        <div className="flex w-full">
          <div className="w-1/4 min-w-[280px] border-r">
            <SurveyList />
          </div>
          <div className="w-3/4">
            <EmptySurveyPage />
          </div>
        </div>
      ) : (
        <SurveyList />
      )}
    </>
  );
};
export default ListPage;
