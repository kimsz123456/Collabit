"use client";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import SurveyList from "@/features/survey/ui/refactor/SurveyList";
import SurveyRoom from "@/features/survey/ui/refactor/SurveyRoom";

const DetailPage = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isDesktop ? (
        <div className="flex w-full">
          <div className="w-1/4 min-w-[280px] border-r">
            <SurveyList />
          </div>
          <div className="w-3/4">
            <SurveyRoom />
          </div>
        </div>
      ) : (
        <SurveyRoom />
      )}
    </>
  );
};
export default DetailPage;
