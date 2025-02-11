"use client";
import ChatListCard from "@/entities/chat/ui/ChatListCard";
import ChatNav from "@/entities/chat/ui/ChatNav";
import EmptySurveyList from "@/entities/survey/ui/EmptySurveyList";
import { useSurveyList } from "../context/SurveyListProvider";

export default function SurveyList() {
  const { surveyList } = useSurveyList();

  return (
    <div className="flex flex-col items-center gap-3 px-2 md:py-4">
      <ChatNav />
      <div className="flex h-[calc(100vh-220px)] w-full flex-col gap-2 overflow-y-auto md:h-[calc(100vh-192px)]">
        {surveyList.length > 0 ? (
          surveyList.map((item) => (
            <ChatListCard
              type="survey"
              key={item.surveyCode}
              id={item.surveyCode}
              nickname={item.nickname}
              profileImage={item.profileImage}
              title={item.nickname}
              description={item.title}
              updatedAt={item.updatedAt}
              unRead={item.status}
            />
          ))
        ) : (
          <EmptySurveyList />
        )}
      </div>
    </div>
  );
}
