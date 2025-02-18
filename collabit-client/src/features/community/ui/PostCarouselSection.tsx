"use client";
import DotIndicator from "@/entities/common/ui/DotIndicator";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { useEffect, useState } from "react";
import MainCommunityCard from "./MainComminityCard";
import { useQuery } from "@tanstack/react-query";
import { getMainPostAPI, getRecommendPostAPI } from "@/shared/api/community";
import { useRouter } from "next/navigation";

const PostCarouselSection = ({ type }: { type: string }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const router = useRouter();
  const { data: latestPost } = useQuery({
    queryKey: ["latestPost"],
    queryFn: () => getMainPostAPI(),
    enabled: type === "latest",
  });

  const { data: recommendPost } = useQuery({
    queryKey: ["recommendPost"],
    queryFn: () => getRecommendPostAPI(),
    enabled: type === "recommend",
  });

  const data = type === "latest" ? latestPost : recommendPost;

  // data가 배열인지 확인하고, 배열이 아니면 빈 배열을 사용
  const posts = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (!api || !data) return;

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    setTimeout(() => {
      const snapList = api.scrollSnapList();
      setCount(snapList.length);
      setCurrent(api.selectedScrollSnap() + 1);
    }, 100);

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, data]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
      <h3 className="text-lg font-bold md:text-xl">
        {type === "latest" ? "요즘 핫한 소식" : "추천 게시물"}
      </h3>

      <div className="flex w-full flex-col items-center justify-center gap-4">
        {!posts || posts.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            {type === "latest"
              ? "아직 게시물이 없습니다."
              : "추천 게시물이 없습니다."}
          </p>
        ) : (
          <>
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
              }}
              className="h-full w-full"
            >
              <CarouselContent className="h-full">
                {posts.map((post) => (
                  <CarouselItem
                    key={post.code}
                    className="md:basis-1/2 lg:basis-1/3"
                    onClick={() => {
                      router.push(`/community/posts/${post.code}`);
                    }}
                  >
                    <div className="h-full px-2 py-2">
                      <MainCommunityCard data={post} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
            <DotIndicator
              current={current}
              count={count}
              api={api}
              setCurrent={setCurrent}
              setCount={setCount}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PostCarouselSection;
