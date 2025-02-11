"use client";

import { Button } from "@/shared/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/shared/lib/shadcn/utils";
import { PostListResponse } from "@/shared/types/response/post";

export const CommunityCardActions = ({ post }: { post: PostListResponse }) => {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <div className="flex items-center gap-1 px-2 py-1">
        <MessageCircle className="size-4" />
        <span className="text-sm">{post.commentCount}</span>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" className="flex items-center px-2 py-1">
          <Heart
            className={cn(
              "size-4",
              post.liked && "fill-red-500 text-red-500",
            )}
          />
          <span className="text-sm">{post.likeCount}</span>
        </Button>
      </div>
      <Button variant="ghost" className="flex items-center px-2 py-1">
        <Send className="size-4" />
      </Button>
    </div>
  );
};
