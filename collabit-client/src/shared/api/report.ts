import { ChartResponse, ReportStatusResponse } from "../types/response/report";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const flaskUrl = process.env.NEXT_PUBLIC_AI_URL;

const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export const createPortfolioSpringAPI = async () => {
  try {
    const res = await fetch(`${apiUrl}/portfolio`, {
      method: "POST",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("포트폴리오 생성에 실패했습니다.");
    }
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPortfolioFlaskAPI = async () => {
  try {
    const res = await fetch(`${flaskUrl}/portfolio`, {
      method: "POST",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("포트폴리오 생성에 실패했습니다.");
    }
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPortfolioStatusAPI =
  async (): Promise<ReportStatusResponse> => {
    try {
      const res = await fetch(`${apiUrl}/portfolio`, {
        method: "GET",
        ...fetchOptions,
      });
      if (!res.ok) {
        throw new Error("포트폴리오 상태 조회에 실패했습니다.");
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export const getPortfolioDataAPI = async (): Promise<ChartResponse> => {
  try {
    const res = await fetch(`${apiUrl}/portfolio/data`, {
      method: "GET",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("데이터 조회에 실패했습니다.");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPortfolioShareAPI = async (
  userId: string,
): Promise<ChartResponse> => {
  try {
    const res = await fetch(`${apiUrl}/portfolio/share/${userId}`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("데이터 조회에 실패했습니다.");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
