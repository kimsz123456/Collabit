"use client";
import UserAvatar from "@/entities/common/ui/UserAvatar";
import { getCommentAPI } from "@/shared/api/comment";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CommentReplyInput from "./CommentReplyInput";
import CommentChildCard from "./CommentChildCard";

const CommentList = ({ postCode }: { postCode: number }) => {
  const { data } = useQuery({
    queryKey: ["commentList", postCode],
    queryFn: () => getCommentAPI(postCode),
    enabled: !!postCode,
  });

  const [activeReplyInputs, setActiveReplyInputs] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleReplyInput = (commentCode: number) => {
    setActiveReplyInputs((prev) => ({
      ...prev,
      [commentCode]: !prev[commentCode],
    }));
  };

  return (
    <ul className="mx-2 mb-10 flex flex-col gap-6">
      {data?.map((item) => (
        <li key={item.code} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserAvatar user={item.author} size="sm" />
              <button
                className="text-sm text-muted-foreground"
                onClick={() => toggleReplyInput(item.code)}
              >
                답글달기
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="ml-8">{item.content}</p>
          {activeReplyInputs[item.code] && (
            <CommentReplyInput
              onCancel={() => toggleReplyInput(item.code)}
              postCode={postCode}
              parentCommentCode={item.code}
            />
          )}
          {item.replies?.map((child) => (
            <CommentChildCard key={child.code} child={child} />
          ))}
        </li>
      ))}
    </ul>
  );
};

export default CommentList;
