"use client";

import CommunityDetail from "@/features/community/ui/CommunityDetail";
import { getPostAPI } from "@/shared/api/community";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ModalPostDetail = ({ postId }: { postId: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const { data: post } = useQuery({
    queryKey: ["postDetail", Number(postId)],
    queryFn: () => getPostAPI(Number(postId)),
  });
  if (!post) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        router.back();
      }}
    >
      <DialogContent
        className="max-h-[80vh] max-w-[800px] overflow-y-auto"
        onEscapeKeyDown={() => setIsOpen(!isOpen)}
        onInteractOutside={() => setIsOpen(!isOpen)}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{`${post.code}번 게시글`}</DialogTitle>
          <DialogDescription className="sr-only">
            {post.content?.length >= 100
              ? `${post.content.slice(0, 100)}...`
              : post.content}
          </DialogDescription>
        </DialogHeader>
        <CommunityDetail postId={postId} />
      </DialogContent>
    </Dialog>
  );
};

export default ModalPostDetail;
