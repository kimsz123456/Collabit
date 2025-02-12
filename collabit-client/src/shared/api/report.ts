import {
  AISummaryResponse,
  ChartResponse,
  ReportInfoResponse,
  ReportStatusResponse,
  TimelineResponse,
  WordCloudResponse,
} from "../types/response/report";
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

export const getPortfolioInfoAPI = async (): Promise<ReportInfoResponse> => {
  try {
    const res = await fetch(`${apiUrl}/portfolio/info`, {
      method: "GET",
      ...fetchOptions,
    });

    if (!res.ok) {
      throw new Error("포트폴리오 정보 조회에 실패했습니다.");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPortfolioChartAPI = async (): Promise<ChartResponse> => {
  try {
    const res = await fetch(`${apiUrl}/portfolio/multiple/graph`, {
      method: "GET",
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error("차트 조회에 실패했습니다.");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPortfolioTimelineChartAPI =
  async (): Promise<TimelineResponse> => {
    try {
      const res = await fetch(`${apiUrl}/portfolio/multiple/timeline`, {
        method: "GET",
        ...fetchOptions,
      });
      if (!res.ok) {
        throw new Error("타임라인 차트 조회에 실패했습니다.");
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export const getPortfolioWordCloudAPI =
  async (): Promise<WordCloudResponse> => {
    try {
      const res = await fetch(`${flaskUrl}/portfolio/essay/wordcloud`, {
        method: "GET",
        ...fetchOptions,
      });
      if (!res.ok) {
        throw new Error("워드클라우드 조회에 실패했습니다.");
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export const getPortfolioAISummaryAPI =
  async (): Promise<AISummaryResponse> => {
    try {
      const res = await fetch(`${flaskUrl}/portfolio/essay/ai-summary`, {
        method: "GET",
        ...fetchOptions,
      });
      if (!res.ok) {
        throw new Error("AI 요약 조회에 실패했습니다.");
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
