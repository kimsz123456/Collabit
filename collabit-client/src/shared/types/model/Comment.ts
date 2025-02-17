export interface Comment {
  code: number;
  postCode: number;
  userCode: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentCommentCode: number;
  isDeleted: boolean;
}
