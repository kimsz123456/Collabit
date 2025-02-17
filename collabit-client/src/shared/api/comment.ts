import {
  CommentResponse,
  CreateCommentResponse,
  EditCommentResponse,
} from "../types/response/comment";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const createCommentAPI = async ({
  postCode,
  content,
  parentCode,
}: {
  postCode: number;
  content: string;
  parentCode?: number;
}): Promise<CreateCommentResponse> => {
  const response = await fetch(`${apiUrl}/post/${postCode}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, parentCode }),
    credentials: "include",
  });
  return response.json();
};

export const getCommentAPI = async (
  postCode: number,
): Promise<CommentResponse[]> => {
  const response = await fetch(`${apiUrl}/post/${postCode}/comment`);
  return response.json();
};

export const editCommentAPI = async (
  commentCode: number,
  content: string,
): Promise<EditCommentResponse> => {
  const response = await fetch(`${apiUrl}/comment/${commentCode}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
    credentials: "include",
  });
  return response.json();
};

export const deleteCommentAPI = async (commentCode: number) => {
  const response = await fetch(`${apiUrl}/comment/${commentCode}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};
