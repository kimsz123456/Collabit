import UserAvatar from "@/entities/common/ui/UserAvatar";
import { CommunityCardActions } from "@/entities/community/ui/CommunityCardAction";
import { CommunityCardMenu } from "@/entities/community/ui/CommunityCardMenu";
import { cn } from "@/shared/lib/shadcn/utils";
import { PostListResponse } from "@/shared/types/response/post";
import formatRelativeTime from "@/shared/utils/formatRelativeTime";
import Image from "next/image";
import Link from "next/link";

const CommunityCard = ({ post }: { post: PostListResponse }) => {
  return (
    <Link
      href={`/community/${post.code}`}
      className="flex w-full flex-col gap-2 border-b border-b-border px-2 py-5"
    >
      <div className="flex w-full items-center justify-between">
        <UserAvatar
          user={{
            nickname: post.author.nickname,
            profileImage: post.author.profileImage,
            githubId: post.author.githubId,
          }}
          time={formatRelativeTime(post.createdAt.toString())}
        />
        <CommunityCardMenu post={post} />
      </div>
      <p className="px-2 text-base">{post.content}</p>
      <ul
        className={cn(
          post.images.length > 0 &&
            "mx-2 grid h-[195px] w-full max-w-[350px] overflow-hidden rounded-lg md:h-[260px] md:w-[400px]",
          post.images.length === 1 && "grid-cols-1",
          post.images.length === 2 && "grid-cols-2",
          post.images.length === 3 &&
            "grid-cols-2 grid-rows-2 [&>*:first-child]:row-span-2",
          post.images.length === 4 && "grid-cols-2 grid-rows-2",
        )}
      >
        {post.images.map((image, index) => (
          <li
            key={index}
            className={cn(
              "relative h-full w-full",
              post.images.length === 3 && index > 0 && "h-[130px]",
              post.images.length === 3 && index === 0 && "h-[260px]",
              ((post.images.length >= 2 && index % 2 === 1) ||
                (post.images.length === 3 && index === 2)) &&
                "border-l-2 border-gray-400",
              post.images.length >= 2 &&
                index >= 2 &&
                "border-t-2 border-gray-400",
            )}
          >
            <Image
              className="object-cover"
              src={image}
              alt={`미리보기 ${index + 1}`}
              fill
              sizes="(max-width: 400px) 100vw"
            />
          </li>
        ))}
      </ul>
      <CommunityCardActions post={post} />
    </Link>
  );
};

export default CommunityCard;
