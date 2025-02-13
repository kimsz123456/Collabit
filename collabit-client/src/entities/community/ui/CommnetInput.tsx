"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useState } from "react";

interface CommponetInputProps {
  img: string;
  nickname: string;
  postCode: number;
}

const CommponetInput = ({ img, nickname, postCode }: CommponetInputProps) => {
  const [comments, setComments] = useState("");
  const handleSubmit = () => {
    console.log(comments, postCode);
  };
  return (
    <div className="flex items-center justify-between gap-2 border-b border-b-border pb-2">
      <div className="flex w-full items-center gap-2">
        <Avatar>
          <AvatarImage src={img} />
          <AvatarFallback>{nickname.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <Input
          className="w-full border-none shadow-none"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
      </div>
      <Button variant="outline" onClick={handleSubmit}>
        댓글 작성
      </Button>
    </div>
  );
};

export default CommponetInput;
