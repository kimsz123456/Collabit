"use client";
import CommunityCard from "@/features/community/ui/CommunityCard";
import { getMyPostListAPI } from "@/shared/api/community";
import { PageResponse } from "@/shared/types/response/page";
import { PostListResponse } from "@/shared/types/response/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
interface MyPostListProps {
  initialPosts: PageResponse<PostListResponse>;
}
const MyPostList = ({ initialPosts }: MyPostListProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["myPostList", "infinite"],
      staleTime: 0,
      queryFn: ({ pageParam = 0 }) =>
        getMyPostListAPI({ currentPage: pageParam }),
      initialPageParam: 0,
      initialData: {
        pages: [initialPosts],
        pageParams: [0],
      },
      getNextPageParam: (lastPage) => {
        return lastPage.hasNext ? lastPage.pageNumber + 1 : undefined;
      },
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          try {
            await fetchNextPage();
          } catch (error) {
            console.error("Error fetching next page:", error);
          }
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.content.map((post) => (
            <CommunityCard key={post.code} post={post} />
          ))}
        </div>
      ))}
      <div ref={ref} className="h-10 py-10">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-violet-600" />
          </div>
        )}
      </div>
    </>
  );
};

export default MyPostList;
