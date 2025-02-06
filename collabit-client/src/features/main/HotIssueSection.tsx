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
import MainCommunityCard from "../community/ui/MainComminityCard";

const HotIssueSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
      <h3 className="text-lg font-bold md:text-xl">요즘 핫한 소식</h3>

      <div className="flex w-full flex-col items-center justify-center gap-4">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="px-2 py-2">
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

export default HotIssueSection;
const post = {
  code: 123,
  content: "123",
  createdAt: "2025-01-02",
  updatedAt: "2025-01-02",
  images: ["https://github.com/kimchulsoo.png"],
  likes: 10,
  comments: 5,
  isLiked: false,
  author: {
    nickname: "김철수",
    githubId: "kimchulsoo",
    profileImage: "https://github.com/kimchulsoo.png",
  },
};
