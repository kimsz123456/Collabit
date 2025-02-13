"use client";

import CommunityDetail from "@/features/community/ui/CommunityDetail";
import { PostDetailResponse } from "@/shared/types/response/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useRouter } from "next/navigation";

const ModalPostDetail = ({ post }: { post: PostDetailResponse }) => {
  const router = useRouter();

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        router.back();
      }}
    >
      <DialogContent
        className="max-h-[80vh] max-w-[800px] overflow-y-auto"
        onEscapeKeyDown={() => router.back()}
        onInteractOutside={() => router.back()}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{`${post.code}번 게시글`}</DialogTitle>
          <DialogDescription className="sr-only">
            {post.content?.length >= 100
              ? `${post.content.slice(0, 100)}...`
              : post.content}
          </DialogDescription>
        </DialogHeader>
        <CommunityDetail post={post} />
      </DialogContent>
    </Dialog>
  );
};

export default ModalPostDetail;
