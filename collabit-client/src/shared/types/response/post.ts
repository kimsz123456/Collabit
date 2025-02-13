import { Image, Post } from "../model/Post";
import { User } from "../model/User";

export type PostListResponse = Pick<
  Post,
  "code" | "content" | "createdAt" | "updatedAt"
> & { author: Pick<User, "nickname" | "profileImage" | "githubId"> } & {
  images: Image["url"][];
  likeCount: number;
  commentCount: number;
  liked: boolean;
};

export type PostDetailResponse = Pick<
  Post,
  "code" | "content" | "createdAt" | "updatedAt"
> & { author: Pick<User, "nickname" | "profileImage" | "githubId"> } & {
  images: Image["url"][];
  likeCount: number;
  commentCount: number;
  liked: boolean;
};
