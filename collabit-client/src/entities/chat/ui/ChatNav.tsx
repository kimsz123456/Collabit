import TabNavButton from "@/entities/common/ui/TabNavButton";

const ChatNav = () => {
  return (
    <div className="flex w-full justify-evenly border-b border-b-border pb-[14px] pt-3">
      <TabNavButton href="/chat">1:1 채팅</TabNavButton>
      <TabNavButton href="/survey">AI 챗봇</TabNavButton>
    </div>
  );
};

export default ChatNav;
