"use client";

import { getMyPostListAPI } from "@/shared/api/community";
import { PostListResponse } from "@/shared/types/response/post";
import { PageResponse } from "@/shared/types/response/page";
import PostList from "@/widget/community/PostList";
import { useQuery } from "@tanstack/react-query";
import EmptyMyPost from "@/widget/mypage/EmptyMyPost";

const ContentsPage = () => {
  const { data: posts } = useQuery<PageResponse<PostListResponse>, Error>({
    queryKey: ["myPostList"],
    queryFn: () => getMyPostListAPI({ currentPage: 0 }),
  });

  if (!posts) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {posts.content.length === 0 ? (
        <EmptyMyPost />
      ) : (
        <PostList initialPosts={posts} />
      )}
    </div>
  );
};

export default ContentsPage;
