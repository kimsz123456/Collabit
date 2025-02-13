"use client";

import { useAuth } from "@/features/auth/api/useAuth";
import usePost from "@/features/community/api/usePost";
import { PostListResponse } from "@/shared/types/response/post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { DeleteIcon, Ellipsis, Pencil } from "lucide-react";

export const CommunityCardMenu = ({ post }: { post: PostListResponse }) => {
  const { userInfo } = useAuth();
  const { deletePost } = usePost();

  if (userInfo?.nickname !== post.author.nickname) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1">
        <Ellipsis
          style={{ width: "1.2rem", height: "1.2rem" }}
          className="text-muted-foreground"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            deletePost(post.code);
          }}
          className="cursor-pointer text-red-500"
        >
          <DeleteIcon />
          게시물 삭제
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
          <Pencil />
          게시물 수정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
