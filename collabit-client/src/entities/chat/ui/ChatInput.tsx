import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { SendIcon } from "lucide-react";

interface ChatInputProps {
  disabled?: boolean;
  message: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ChatInput = ({
  disabled,
  message,
  setInputMessage,
  handleSendMessage,
}: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      e.nativeEvent.isComposing === false
    ) {
      e.preventDefault();
      if (message.trim() !== "") {
        handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
      <Textarea
        placeholder="메시지를 입력하세요"
        className="max-h-[200px] min-h-9 w-full resize-none bg-white text-sm md:text-base"
        value={message}
        onChange={(e) => {
          setInputMessage(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
      />
      <Button
        type="submit"
        className="flex items-center justify-center"
        disabled={disabled}
      >
        <SendIcon className="h-full w-full" />
      </Button>
    </form>
  );
};

export default ChatInput;
