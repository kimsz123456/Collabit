import { PageResponse } from "./../types/response/page";
import { CreatePostRequest, EditPostAPIRequest } from "../types/request/post";
import { PostDetailResponse, PostListResponse } from "../types/response/post";
import optimizeImageToWebP from "../utils/optimizeImageToWebP";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export const createPostAPI = async (post: CreatePostRequest) => {
  const formData = new FormData();
  formData.append("content", post.content);

  await Promise.all(
    post.images.map(async (image) => {
      try {
        const optimizedImage = await optimizeImageToWebP(image);
        const fileName = image.name.replace(/\.[^/.]+$/, "") + ".webp";
        formData.append("images", optimizedImage, fileName);
      } catch (error) {
        console.error("이미지 최적화 중 오류:", error);
        formData.append("images", image);
      }
    }),
  );

  const response = await fetch(`${apiUrl}/post`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return response.json();
};
interface GetPostListAPIProps {
  currentPage: number;
}
export const getPostListAPI = async ({
  currentPage,
}: GetPostListAPIProps): Promise<PageResponse<PostListResponse>> => {
  const response = await fetch(`${apiUrl}/post?pageNumber=${currentPage}`, {
    method: "GET",
    ...fetchOptions,
    next: {
      revalidate: 10,
      tags: ["postList"],
    },
  });

  if (response.status === 204) {
    return {
      content: [],
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
      hasNext: false,
    };
  }

  const data = await response.json();

  return data;
};

export const getPostAPI = async (
  postCode: number,
): Promise<PostDetailResponse> => {
  const response = await fetch(`${apiUrl}/post/${postCode}`, {
    ...fetchOptions,
    // next: {
    //   revalidate: 10,
    //   tags: ["postDetail", postCode.toString()],
    // },
  });
  return response.json();
};

export const editPostAPI = async ({
  postCode,
  post,
}: EditPostAPIRequest): Promise<{ code: number }> => {
  const formData = new FormData();
  formData.append("content", post.content);

  post.images?.forEach((image) => {
    formData.append("images", image);
  });

  const response = await fetch(`${apiUrl}/post/${postCode}`, {
    method: "PATCH",
    body: formData,
    ...fetchOptions,
  });
  return response.json();
};

export const deletePostAPI = async (postCode: number) => {
  const response = await fetch(`${apiUrl}/post/${postCode}`, {
    method: "DELETE",
    ...fetchOptions,
  });

  return response;
};

export const likePostAPI = async (postCode: number): Promise<void> => {
  const response = await fetch(`${apiUrl}/post/${postCode}/like`, {
    method: "POST",
    ...fetchOptions,
  });
  return response.json();
};

export const unlikePostAPI = async (postCode: number): Promise<void> => {
  const response = await fetch(`${apiUrl}/post/${postCode}/like`, {
    method: "DELETE",
    ...fetchOptions,
  });
  return response.json();
};

export const getMainPostAPI = async (): Promise<PostListResponse[]> => {
  try {
    const response = await fetch(`${apiUrl}/post/latest`, {
      ...fetchOptions,
    });
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getRecommendPostAPI = async (): Promise<PostListResponse[]> => {
  try {
    const response = await fetch(`${apiUrl}/post/recommend`, {
      ...fetchOptions,
    });
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

interface GetMyPostListAPIProps {
  currentPage: number;
}
export const getMyPostListAPI = async ({
  currentPage,
}: GetMyPostListAPIProps): Promise<PageResponse<PostListResponse>> => {
  const response = await fetch(
    `${apiUrl}/post/myPost?pageNumber=${currentPage}`,
    {
      method: "GET",
      ...fetchOptions,
    },
  );

  if (response.status === 204) {
    return {
      content: [],
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
      hasNext: false,
    };
  }

  const data = await response.json();

  return data;
};
