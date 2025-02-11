import {
  MultipleQueriesResponse,
  SurveyDetailResponse,
  SurveyListResponse,
} from "../types/response/survey";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const flaskApiUrl = process.env.NEXT_PUBLIC_AI_URL;

// 설문 리스트 조회
export const getSurveyListAPI = async (): Promise<SurveyListResponse[]> => {
  const response = await fetch(`${apiUrl}/survey`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("설문 리스트 조회 실패");
  }
  return response.json();
};

// 객관식 설문 시작 Get
export const getSurveyMultipleQueryAPI = async (): Promise<
  MultipleQueriesResponse[]
> => {
  const response = await fetch(`${apiUrl}/survey/question`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("객관식 설문 시작 실패");
  }
  return response.json();
};

// 객관식 설문 답변 전송 post
// survey/{surveyCode}/multiple
export const sendMultipleSurveyAnswerAPI = async (
  surveyCode: number,
  scores: number[],
) => {
  const response = await fetch(`${apiUrl}/survey/${surveyCode}/multiple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ scores }),
  });
  console.log(response);

  if (!response.ok) {
    throw new Error("객관식 설문 답변 전송 실패");
  }
  return response.json();
};

// 주관식 설문 시작 post
//survey/{surveyCode}
export const startEssaySurveyAPI = async (
  surveyCode: number,
  body: string,
): Promise<Response> => {
  const response = await fetch(`${flaskApiUrl}/survey/${surveyCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ nickname: body }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("주관식 설문 시작 실패");
  }
  return response;
};

// 주관식 설문 진행 post
//survey/{surveyCode}/essay
export const essaySurveyProgressAPI = async (
  surveyCode: number,
  body: string,
): Promise<Response> => {
  console.log(body);

  const response = await fetch(`${flaskApiUrl}/survey/${surveyCode}/essay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream", // SSE를 위한 헤더 추가
    },
    body: JSON.stringify({ content: body }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("주관식 설문 진행 실패");
  }

  return response;
};

// 설문 디테일 조회

export const getSurveyDetailAPI = async (
  surveyCode: number,
): Promise<SurveyDetailResponse> => {
  const response = await fetch(`${apiUrl}/survey/${surveyCode}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("설문 디테일 조회 실패");
  }

  const data = await response.json();

  if (!data) {
    throw new Error("응답 데이터가 비어있습니다");
  }

  return data;
};
