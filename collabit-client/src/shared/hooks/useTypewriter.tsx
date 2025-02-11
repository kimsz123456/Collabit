import { useState, useEffect } from "react";

export const useTypewriter = (
  text: string,
  options: {
    enabled: boolean;
  },
  speed: number = 60,
  chunkSize: number = 3,
) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // enabled가 false면 전체 텍스트를 바로 표시
    if (!options.enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // enabled가 true일 때만 타이핑 애니메이션 실행
    let index = 0;
    setIsTyping(true);
    setDisplayedText("");

    const timer = setInterval(() => {
      if (index < text.length) {
        const chunk = text.slice(index, index + chunkSize);
        setDisplayedText((prev) => prev + chunk);
        index += chunkSize;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, chunkSize, options.enabled]);

  return { displayedText, isTyping };
};
