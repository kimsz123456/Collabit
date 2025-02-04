import { UserInfo } from "@/shared/types/model/User";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import TextareaAutosize from "react-textarea-autosize";

interface PostProps {
  userInfo?: UserInfo;
  images: File[];
  preview: string[];
  content: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleDeleteImage: (index: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Post = ({
  userInfo,
  images,
  preview,
  content,
  handleImageChange,
  handleContentChange,
  handleDeleteImage,
  handleSubmit,
}: PostProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col items-center gap-4 border-b p-4"
    >
      <div className="flex w-full gap-1">
        <Avatar>
          <AvatarImage src={userInfo?.profileImage} />
          <AvatarFallback>{userInfo?.nickname.slice(0, 2)}</AvatarFallback>
        </Avatar>

        <TextareaAutosize
          className="mt-1 w-full resize-none rounded-md border border-none bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
          placeholder="무슨 생각을 하고 계신가요?"
          minRows={1}
          readOnly={!userInfo}
          value={userInfo ? content : "로그인 후 이용해주세요."}
          onChange={handleContentChange}
        />
        <div className="group relative h-9 w-9 rounded-lg hover:bg-gray-100">
          <input
            type="file"
            multiple
            className="absolute inset-0 z-10 h-9 w-9 cursor-pointer opacity-0"
            aria-label="파일 업로드"
            disabled={images.length === 4 || !userInfo}
            onChange={handleImageChange}
          />
          {userInfo ? (
            <>
              <Button
                variant="ghost"
                type="button"
                disabled={images.length === 4}
                className="h-9 w-9 p-0"
              >
                <ImagePlus className="h-full w-full text-gray-900" />
              </Button>
              <span className="invisible absolute -bottom-8 left-1/2 z-[9999] -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:visible">
                {images.length === 4
                  ? "이미지는 최대 4개까지 업로드 가능합니다"
                  : `이미지 업로드 (${images.length}/4)`}
              </span>
            </>
          ) : null}
        </div>

        <Button disabled={!userInfo} type="submit" variant="outline">
          게시
        </Button>
      </div>

      {preview.length > 0 && (
        <Carousel
          opts={{
            align: "start",
          }}
          setApi={setApi}
          className="w-full px-10"
        >
          <CarouselContent>
            {preview.map((prev, index) => (
              <CarouselItem
                key={index}
                className={preview.length > 1 ? "basis-1/2" : "basis-full"}
              >
                <div className="p-1">
                  <Card className="">
                    <CardContent className="relative flex h-[100px] items-center justify-center p-6 md:h-[300px]">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="group absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 p-1.5 transition-colors hover:bg-black/80 md:h-8 md:w-8"
                      >
                        <X className="h-4 w-4 text-white md:h-4 md:w-4" />
                        <span className="invisible absolute -bottom-8 -left-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:visible">
                          이미지 삭제
                        </span>
                      </button>
                      <Image
                        className="object-contain"
                        src={prev}
                        alt={`미리보기 ${index + 1}`}
                        fill
                        sizes="(max-width: 400px) 100vw"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            type="button"
            className="absolute left-12 h-6 w-6 md:h-8 md:w-8"
            hide={true}
          />
          <CarouselNext
            type="button"
            className="absolute right-12 h-6 w-6 md:h-8 md:w-8"
            hide={true}
          />
        </Carousel>
      )}
    </form>
  );
};

export default Post;
