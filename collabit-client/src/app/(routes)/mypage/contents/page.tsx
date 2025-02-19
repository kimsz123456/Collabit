"use client";

import { getMyPostListAPI } from "@/shared/api/community";
import MyPostList from "@/widget/community/MyPostList";
import EmptyMyPost from "@/widget/mypage/EmptyMyPost";
import { useQuery } from "@tanstack/react-query";

const ContentsPage = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => getMyPostListAPI({ currentPage: 0 }),
  });

  if (isLoading) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (!posts) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {posts.content.length === 0 ? (
        <EmptyMyPost />
      ) : (
        <MyPostList initialPosts={posts} />
      )}
    </div>
  );
};

export default ContentsPage;
