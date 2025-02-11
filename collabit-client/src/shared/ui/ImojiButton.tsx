import { cn } from "../lib/shadcn/utils";

interface ImojiButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
  role?: string;
  index: number;
  disabled?: boolean;
  "aria-checked"?: boolean;
  "aria-label"?: string;
}

const ImojiButton = ({
  children,
  onClick,
  isSelected,
  role,
  index = 3,
  disabled = false,
  "aria-checked": ariaChecked,
  "aria-label": ariaLabel,
}: ImojiButtonProps) => {
  const getStyles = (idx: number, selected: boolean) => {
    const baseColors = {
      0: "bg-red-300",
      1: "bg-orange-300",
      2: "bg-yellow-300",
      3: "bg-green-300",
      4: "bg-emerald-300",
    }[idx];

    if (!selected) return baseColors;

    return `${baseColors} ring-2 ring-offset-2 ring-violet-600 scale-110 shadow-lg`;
  };

  return (
    <button
      type="button"
      role={role}
      className={cn(
        "flex h-6 w-6 flex-col items-center justify-center gap-1 rounded-lg md:h-9 md:w-9",
        "transition-all duration-200 ease-in-out",
        getStyles(index, isSelected),
        disabled && "cursor-default opacity-80",
      )}
      aria-label={ariaLabel}
      aria-checked={ariaChecked}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-md rounded-full [text-shadow:_1px_1px_0_rgba(0,0,0,0.3),_-1px_-1px_0_rgba(255,255,255,0.8)] md:text-xl">
        {children}
      </span>
    </button>
  );
};
export default ImojiButton;
