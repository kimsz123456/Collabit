export interface CreatePostRequest {
  content: string;
  images: File[];
}

export interface EditPostRequest {
  content: string;
  images: File[];
}
export type EditPostAPIRequest = {
  postCode: number;
  post: EditPostRequest;
};
