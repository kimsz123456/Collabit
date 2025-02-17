"use client";
import UserAvatar from "@/entities/common/ui/UserAvatar";
import { getCommentAPI } from "@/shared/api/comment";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { useQuery } from "@tanstack/react-query";
import CommponetInput from "./CommnetInput";
import { useState } from "react";

const CommentList = ({ postCode }: { postCode: number }) => {
  // const data = await getCommentAPI(postCode);
  // console.log(data);

  const [replyStates, setReplyStates] = useState<{ [key: number]: boolean }>(
    {},
  );
  const { data } = useQuery({
    queryKey: ["commentList", postCode],
    queryFn: () => getCommentAPI(postCode),
    enabled: !!postCode,
  });

  const toggleReply = (commentCode: number) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentCode]: !prev[commentCode],
    }));
  };

  return (
    <ul className="mb-10 flex flex-col gap-4">
      {data?.map((item) => {
        console.log(item.code);
        return (
          <li key={item.code} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserAvatar user={item.author} />
                <button
                  className="text-sm text-muted-foreground"
                  onClick={() => toggleReply(item.code)}
                >
                  답글달기
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
            <p className="ml-12">{item.content}</p>
            <CommponetInput
              img={item.author.profileImage}
              nickname={item.author.nickname}
              postCode={postCode}
              parentCode={item.code}
              onCancel={() => setReplyStates({})}
              hidden={!replyStates[item.code]}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default CommentList;
