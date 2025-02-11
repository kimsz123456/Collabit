import { useSurveyStore } from "@/shared/lib/stores/surveyStore";
import ImojiButton from "@/shared/ui/ImojiButton";
import { useState } from "react";

interface SurveyMultipleSelectButtonProps {
  index: number;
  onClick?: () => void;
  selectedScore?: number;
  readOnly?: boolean;
}

const SurveyMultipleSelectButton = ({
  index,
  onClick,
  selectedScore,
  readOnly = false,
}: SurveyMultipleSelectButtonProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(
    selectedScore || null,
  );
  const setMultipleAnswers = useSurveyStore(
    (state) => state.setMultipleAnswers,
  );

  const handleClick = (value: number) => {
    if (readOnly) return;

    setMultipleAnswers(value, index);
    setSelectedValue(value);
    onClick?.();
  };

  return (
    <div
      className="flex gap-5 text-sm duration-700 animate-in fade-in-0 slide-in-from-bottom-4 md:text-lg"
      role="radiogroup"
      aria-label="만족도 선택"
    >
      {[
        { value: 1, emoji: "😔", label: "매우 불만족" },
        { value: 2, emoji: "🙁", label: "불만족" },
        { value: 3, emoji: "🙂", label: "보통" },
        { value: 4, emoji: "😀", label: "만족" },
        { value: 5, emoji: "😆", label: "매우 만족" },
      ].map(({ value, emoji, label }, btnIndex) => (
        <ImojiButton
          key={value}
          isSelected={selectedValue === value || selectedScore === value}
          onClick={() => handleClick(value)}
          disabled={readOnly}
          role="radio"
          aria-checked={selectedValue === value || selectedScore === value}
          aria-label={label}
          index={btnIndex}
        >
          {emoji}
        </ImojiButton>
      ))}
    </div>
  );
};

export default SurveyMultipleSelectButton;
