import { Card, CardContent } from "@/shared/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import CompareScoreSection from "@/widget/ui/main/CompareScoreSection";

export default function Home() {
  // Todo: 유저 정보 가져오기
  const user = {
    name: "춤추는 라이언",
  };
  return (
    <div className="flex flex-col items-center gap-4 py-5 sm:py-16">
      <h2 className="sr-only">
        메인페이지, 사용자 평균 협업 점수와 프로젝트 소식과 요즘 핫한 소식을
        확인하세요.
      </h2>
      <CompareScoreSection user={user} />

      <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
        <h3 className="text-lg font-bold md:text-xl">나의 프로젝트 소식</h3>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-3xl font-semibold">
                        {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4 border-b-2 border-gray-200 pb-10 md:gap-8">
        <h3 className="text-lg font-bold md:text-xl">요즘 핫한 소식</h3>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-3xl font-semibold">
                        {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
