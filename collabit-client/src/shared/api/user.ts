import { UserInfoResponse } from "../types/response/user";

interface UserNicknameRequest {
  nickname: string;
}

interface UserPasswordRequest {
  password: string;
}

interface UserImageRequest {
  image: string;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
};

export const getUserInfoAPI = async (): Promise<UserInfoResponse> => {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      ...fetchOptions,
    });
    if (!res.ok) {
      return { userInfo: undefined, isAuthenticated: false };
    }
    const data = await res.json();
    return { userInfo: data, isAuthenticated: true };
  } catch {
    return { userInfo: undefined, isAuthenticated: false };
  }
};

export const updateUserNicknameAPI = async (body: UserNicknameRequest) => {
  const res = await fetch(`${apiUrl}/user/nickname`, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  const data = await res.json();
  return data;
};

export const checkUserPasswordAPI = async (body: UserPasswordRequest) => {
  const res = await fetch(`${apiUrl}/user/password`, {
    method: "POST",
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  const data = await res.json();
  return data;
};

export const updateUserPasswordAPI = async (body: UserPasswordRequest) => {
  const res = await fetch(`${apiUrl}/user/password`, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  const data = await res.json();
  return data;
};

export const changeUserImageAPI = async (body: UserImageRequest) => {
  const formData = new FormData();
  formData.append("image", body.image);

  const res = await fetch(`${apiUrl}/user/image`, {
    method: "PATCH",
    body: formData,
    ...fetchOptions,
  });

  const data = await res.json();
  return data;
};

export const linkGithubAccountAPI = async () => {
  const res = await fetch(`${apiUrl}/auth/oauth/link`, {
    ...fetchOptions,
  });
  const data = await res.json();
  return data;
};

export const deleteUserAPI = async () => {
  const res = await fetch(`${apiUrl}/user`, {
    method: "DELETE",
    ...fetchOptions,
  });
  const data = await res.json();
  return data;
};

export const getUserLikePostsAPI = async () => {
  const res = await fetch(`${apiUrl}/user/like`, { ...fetchOptions });
  const data = await res.json();
  return data;
};

export const getUserPostsAPI = async () => {
  const res = await fetch(`${apiUrl}/user/post`, { ...fetchOptions });
  const data = await res.json();
  return data;
};

export const getUserCommentsAPI = async () => {
  const res = await fetch(`${apiUrl}/user/comment`, { ...fetchOptions });
  const data = await res.json();
  return data;
};
