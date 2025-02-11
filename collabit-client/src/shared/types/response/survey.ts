export type SurveyListResponse = {
  surveyCode: number;
  title: string;
  profileImage: string;
  nickname: string;
  status: number;
  updatedAt: string;
};
export interface MultipleQueriesResponse {
  questionNumber: number;
  questionText: string;
}

export interface SurveyDetailResponse {
  nickname: string;
  profileImage: string;
  surveyEssayResponse: SurveyEssayResponse;
  surveyMultipleResponse: SurveyMultipleResponse;
  title: string;
}
export interface SurveyEssayResponse {
  messages: AIChatResponse[];
  submittedAt: string;
}

export interface SurveyMultipleResponse {
  scores: number[];
  submittedAt: string;
}
export interface AIChatResponse {
  role: "assistant" | "user";
  content: string;
  timestamp?: string;
}
