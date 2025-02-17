import { Comment } from "../model/Comment";
import { User } from "../model/User";

export type CommentResponse = Pick<
  Comment,
  "code" | "postCode" | "content" | "createdAt" | "parentCommentCode"
> & {
  author: Pick<User, "nickname" | "profileImage" | "githubId">;
  replies?: CommentResponse[];
};
export type CreateCommentResponse = Pick<
  Comment,
  | "code"
  | "postCode"
  | "content"
  | "createdAt"
  | "updatedAt"
  | "parentCommentCode"
>;
export type EditCommentResponse = CreateCommentResponse;
