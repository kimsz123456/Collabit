"use client";
import DotIndicator from "@/entities/common/ui/DotIndicator";
import { getProjectListForMainAPI } from "@/shared/api/project";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import MainProjectListSkeleton from "@/widget/project/ui/MainProjectListSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import EmptyProjectCard from "../project/ui/EmptyProjectCard";
import MainProjectListCard from "../project/ui/MainProjectListCard";
import NoProjectGuide from "../project/ui/NoProjectGuide";

const MyProjectSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["projectList", "main"],
    queryFn: () => getProjectListForMainAPI(),
  });
  console.log(data);

  const [emptySpace, setEmptySpace] = useState(0);
  useEffect(() => {
    setEmptySpace(Math.max(0, 2 - (data?.length || 0)));
  }, [data]);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
      <h3 className="text-lg font-bold md:text-xl">나의 프로젝트 소식</h3>
      {isLoading ? (
        <MainProjectListSkeleton />
      ) : data!.length > 0 ? (
        <div className="flex h-[200px] w-full flex-col items-center justify-center gap-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
            }}
            className="h-full w-full"
          >
            <CarouselContent className="h-full">
              {data?.map((i, index) => (
                <CarouselItem
                  key={`project-${i.code || index}`}
                  className="h-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full px-2 py-2">
                    <MainProjectListCard
                      organization={i.organization}
                      project={i}
                      // 알림 끄는 코드 추가
                      onClick={() => {}}
                    />
                  </div>
                </CarouselItem>
              ))}
              {Array.from({ length: emptySpace }).map((_, index) => (
                <CarouselItem
                  key={`empty-${index}`}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="px-2 py-2">
                    <EmptyProjectCard />
                  </div>
                </CarouselItem>
              ))}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="h-full px-2 py-2">
                  <EmptyProjectCard />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious
              type="button"
              className="hidden md:flex"
              hide={true}
            />
            <CarouselNext
              type="button"
              className="hidden md:flex"
              hide={true}
            />
          </Carousel>
          <DotIndicator
            current={current}
            count={count}
            api={api}
            setCurrent={setCurrent}
            setCount={setCount}
          />
        </div>
      ) : (
        <div>
          <NoProjectGuide />
        </div>
      )}
    </div>
  );
};

export default MyProjectSection;

// const project = {
//   title: "네이버 페이 리뉴얼",
//   code: 2025,
//   participant: 6,
//   done: false,
//   createdAt: "2024-03-15",
//   participationRate: 0.75,
//   contributors: [
//     {
//       githubId: "github1",
//       profileImage: `https://www.gravatar.com/avatar/github1?d=identicon&f=y`,
//     },
//     {
//       githubId: "github2",
//       profileImage: `https://www.gravatar.com/avatar/github2?d=identicon&f=y`,
//     },
//     {
//       githubId: "johndoe",
//       profileImage: `https://www.gravatar.com/avatar/johndoe?d=identicon&f=y`,
//     },
//     {
//       githubId: "janesmith",
//       profileImage: `https://www.gravatar.com/avatar/janesmith?d=identicon&f=y`,
//     },
//     {
//       githubId: "developer123",
//       profileImage: `https://www.gravatar.com/avatar/developer123?d=identicon&f=y`,
//     },
//     {
//       githubId: "coder456",
//       profileImage: `https://www.gravatar.com/avatar/coder456?d=identicon&f=y`,
//     },
//     {
//       githubId: "techie789",
//       profileImage: `https://www.gravatar.com/avatar/techie789?d=identicon&f=y`,
//     },
//     {
//       githubId: "webdev101",
//       profileImage: `https://www.gravatar.com/avatar/webdev101?d=identicon&f=y`,
//     },
//   ],
//   organization: "organization",
//   organizationImage: "organizationImage",
//   isUpdated: false,
// };
