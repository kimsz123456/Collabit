"use client";
import UserAvatar from "@/entities/common/ui/UserAvatar";
import CommentList from "@/entities/community/ui/CommentList";
import CommponetInput from "@/entities/community/ui/CommnetInput";
import { CommunityCardActions } from "@/entities/community/ui/CommunityCardAction";
import { CommunityCardMenu } from "@/entities/community/ui/CommunityCardMenu";
import { getPostAPI } from "@/shared/api/community";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";

import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const CommunityDetail = ({ postId }: { postId: number }) => {
  const { data: post } = useQuery({
    queryKey: ["postDetail", Number(postId)],
    queryFn: () => getPostAPI(Number(postId)),
  });
  if (!post) return null;
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex h-full w-full flex-col gap-2 border-b border-b-border py-5">
        <div className="flex w-full items-center justify-between">
          <UserAvatar
            user={{
              nickname: post.author?.nickname,
              profileImage: post.author?.profileImage,
              githubId: post.author?.githubId,
            }}
            time={formatRelativeTime(post.createdAt)}
          />
          <CommunityCardMenu post={post} />
        </div>
        <p className="px-2 py-5 text-lg">{post.content}</p>
        {post.images?.length > 0 && (
          <Carousel
            opts={{
              align: "start",
            }}
            // setApi={setApi}
            className="w-full px-10"
          >
            <CarouselContent>
              {post.images.map((item, index) => (
                <CarouselItem
                  key={item}
                  className={
                    post.images.length > 1
                      ? "basis-full md:basis-1/2"
                      : "basis-full"
                  }
                >
                  <div className="p-1">
                    <Card className="">
                      <CardContent className="relative flex h-[300px] items-center justify-center p-6">
                        <Image
                          className="object-contain"
                          src={item}
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
        <CommunityCardActions post={post} />
      </div>
      <CommponetInput postCode={post.code} />
      <CommentList postCode={post.code} />
    </div>
  );
};

export default CommunityDetail;
