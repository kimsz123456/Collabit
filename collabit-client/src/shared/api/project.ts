import { ProjectCreateRequest } from "../types/request/project";
import { ProjectListResponse } from "../types/response/project";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export const createProjectAPI = async (body: ProjectCreateRequest) => {
  try {
    const res = await fetch(`${apiUrl}/project`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error("프로젝트 생성에 실패했습니다.");
    }
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getProjectListForMainAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/project/list/main`, {
      method: "GET",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("메인 프로젝트 조회에 실패했습니다.");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProjectListAPI = async ({
  keyword,
  sort,
}: {
  keyword?: string;
  sort?: string;
}): Promise<ProjectListResponse> => {
  const queryParams = new URLSearchParams();

  if (keyword) queryParams.append("keyword", keyword);
  if (sort) queryParams.append("sort", sort);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${apiUrl}/project?${queryString}`
    : `${apiUrl}/project`;

  try {
    const res = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeProjectAPI = async (code: number) => {
  try {
    const res = await fetch(`${apiUrl}/project/${code}`, {
      method: "DELETE",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("프로젝트 삭제에 실패했습니다.");
    }
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateProjectDoneAPI = async (code: number) => {
  try {
    const res = await fetch(`${apiUrl}/project/done/${code}`, {
      method: "PATCH",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("프로젝트 상태 업데이트에 실패했습니다.");
    }

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const checkProjectUpdateAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/project/new`, {
      method: "GET",
      ...fetchOptions,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error("프로젝트 업데이트 확인에 실패했습니다.");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAddedProjectAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/project/added`, {
      method: "GET",
      ...fetchOptions,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error("추가된 프로젝트 조회에 실패했습니다.");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getHexagonGraphAPI = async (code: number) => {
  try {
    const res = await fetch(`${apiUrl}/project/graph/hexagon/${code}`, {
      method: "GET",
      ...fetchOptions,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error("육각형 그래프 조회에 실패했습니다.");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
