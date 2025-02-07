import { useTypewriter } from "@/shared/hooks/useTypewriter";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import { useState, useEffect } from "react";

interface SurveyBubbleProps {
  isMe: boolean;
  isLoading: boolean;
  message: string;
  component?: React.ReactNode;
  animation?: boolean;
}

const SurveyBubble = ({
  isMe,
  isLoading,
  message,
  component,
  animation = true,
}: SurveyBubbleProps) => {
  const { displayedText, isTyping } = useTypewriter(message, {
    enabled: animation,
  });
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    if (!animation || !isTyping) {
      const timer = setTimeout(() => {
        setShowComponent(true);
      }, 500); // 500ms 딜레이

      return () => clearTimeout(timer);
    } else {
      setShowComponent(false);
    }
  }, [animation, isTyping]);

  if (isMe) {
    return (
      <div className="flex gap-2">
        <span className="rounded-bl-lg rounded-br-lg rounded-tl-lg bg-violet-100 px-3 py-2 text-xs md:text-sm">
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className="flex max-w-[350px] flex-col gap-1 md:max-w-3xl">
      <div className="flex items-center gap-1">
        <Avatar className="flex h-8 w-8 gap-3 rounded-full border-2 border-violet-100">
          <AvatarImage
            className="rounded-full"
            src={`/images/chatbot.png`}
            alt="Chat avatar"
          />
          <AvatarFallback>CB</AvatarFallback>
        </Avatar>
        <div className="text-xs font-semibold md:text-sm">콜라빗AI</div>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 rounded-bl-lg rounded-br-lg rounded-tr-lg bg-gray-100 px-3 py-2">
          {isLoading ? (
            <Image
              src="/icons/chat-loading.svg"
              alt="loading"
              width={24}
              height={24}
            />
          ) : (
            <>
              <span className="text-xs md:text-sm">
                {animation ? displayedText : message}
              </span>
              {(!animation || !isTyping) && showComponent && component}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyBubble;
