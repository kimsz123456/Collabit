import { AIChatResponse } from "@/shared/types/response/survey";
import { create } from "zustand";

interface SurveyDetail {
  nickname: string;
  profileImage: string;
  title: string;
}

interface SurveyStore {
  // 상태
  id: number | null;
  surveyDetail: SurveyDetail | null;
  surveyEssayResponse: AIChatResponse[] | null;
  surveyMultipleResponse: number[] | null;

  multipleAnswers: number[];

  // 액션
  setId: (id: number) => void;
  setSurveyDetail: (detail: SurveyDetail) => void;
  setSurveyEssayResponse: (response: AIChatResponse[]) => void;
  setSurveyMultipleResponse: (response: number[]) => void;
  setMultipleAnswers: (answer: number, index: number) => void;

  resetAnswers: () => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  // 초기 상태
  id: null,
  surveyDetail: null,
  surveyEssayResponse: null,
  surveyMultipleResponse: null,
  multipleAnswers: [],

  // 액션 구현
  setId: (id) => set({ id }),

  setSurveyDetail: (detail) => set({ surveyDetail: detail }),

  setSurveyEssayResponse: (response) => set({ surveyEssayResponse: response }),

  setSurveyMultipleResponse: (response) =>
    set({ surveyMultipleResponse: response }),

  setMultipleAnswers: (answer, index) =>
    set((state) => {
      const newAnswers = [...state.multipleAnswers];
      newAnswers[index] = answer;
      return { multipleAnswers: newAnswers };
    }),

  resetAnswers: () =>
    set({
      id: null,
      surveyDetail: null,
      surveyEssayResponse: null,
      surveyMultipleResponse: null,
      multipleAnswers: [],
    }),
}));
