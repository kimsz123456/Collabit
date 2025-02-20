import { Input } from "@/shared/ui/input";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  keyword: string;
  setKeyword: (value: string) => void;
  debounceTime?: number;
  disabled?: boolean;
}

const SearchBar = ({
  keyword,
  setKeyword,
  disabled,
  debounceTime = 300,
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(keyword);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(inputValue);
    }, debounceTime);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, debounceTime, setKeyword]);

  return (
    <div className="flex w-full items-center">
      <span className="z-10 mr-[-40px] flex h-8 w-8 items-center justify-center">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </span>
      <Input
        disabled={disabled}
        placeholder="레포지토리명을 입력하세요."
        className="ml-2 w-full bg-white py-4 pl-[30px] text-xs"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
