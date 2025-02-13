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
import { useState } from "react";
import MainCommunityCard from "./MainComminityCard";
import { useQuery } from "@tanstack/react-query";
import { getMainPostAPI, getRecommendPostAPI } from "@/shared/api/community";

const PostCarouselSection = ({ type }: { type: string }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
      <h3 className="text-lg font-bold md:text-xl">
        {type === "latest" ? "요즘 핫한 소식" : "추천 게시물"}
      </h3>

      <div className="flex w-full flex-col items-center justify-center gap-4">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
          }}
          className="h-full w-full"
        >
          <CarouselContent className="h-full">
            {data?.map((post) => (
              <CarouselItem
                key={post.code}
                className="md:basis-1/2 lg:basis-1/3"
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
      </div>
    </div>
  );
};

export default PostCarouselSection;
