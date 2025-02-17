import { UserInfoResponse } from "../types/response/user";
import optimizeImageToWebP from "../utils/optimizeImageToWebP";

interface UserNicknameRequest {
  nickname: string;
}

interface UserPasswordRequest {
  currentPassword: string;
}

interface UserPasswordUpdateRequest {
  newPassword: string;
}

interface UserImageRequest {
  image: File;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export const getUserInfoAPI = async (): Promise<UserInfoResponse> => {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("유저 정보 조회 실패");
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
  if (!res.ok) {
    throw new Error("닉네임 변경 실패");
  }
  return { success: true, message: "닉네임 변경 성공" };
};

export const checkUserPasswordAPI = async (body: UserPasswordRequest) => {
  const res = await fetch(`${apiUrl}/user/password`, {
    method: "POST",
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  if (!res.ok) {
    throw new Error("비밀번호 확인 실패");
  }
  return { success: true, message: "비밀번호 확인 성공" };
};

export const updateUserPasswordAPI = async (
  body: UserPasswordUpdateRequest,
) => {
  try {
    const res = await fetch(`${apiUrl}/user/password`, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("비밀번호 변경 실패");
    }
    return { success: true, message: "비밀번호 변경 성공" };
  } catch (error) {
    throw error;
  }
};

export const updateUserImageAPI = async ({ image }: UserImageRequest) => {
  try {
    const optimizedImage = await optimizeImageToWebP(image);
    const fileName = image.name.replace(/\.[^/.]+$/, "") + ".webp";
    const newProfileImage = new FormData();
    newProfileImage.append("newProfileImage", optimizedImage, fileName);

    const res = await fetch(`${apiUrl}/user/image`, {
      method: "PATCH",
      body: newProfileImage,
      credentials: "include" as RequestCredentials,
    });
    if (!res.ok) {
      throw new Error("이미지 변경 실패");
    }
    return { success: true, message: "이미지 변경 성공" };
  } catch (error) {
    throw error;
  }
};

export const linkGithubAccountAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/oauth`, {
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("깃허브 연동 실패");
    }
    return { success: true, message: "깃허브 연동 성공" };
  } catch (error) {
    throw error;
  }
};

export const deleteUserAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      method: "DELETE",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("회원탈퇴 실패");
    }
    return { success: true, message: "회원탈퇴 성공" };
  } catch (error) {
    throw error;
  }
};

export const getUserPostsAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/user/post`, { ...fetchOptions });
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};
