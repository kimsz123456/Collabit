import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface NotificationState {
  surveyRequests: number[];
  surveyResponses: number[];
  chatRequests: number[];
}
interface NotificationAction {
  setSurveyRequests: (ids: number[]) => void;
  setSurveyResponses: (ids: number[]) => void;
  setChatRequests: (ids: number[]) => void;
  reset: () => void;
}

export const useNotificationStore = create<
  NotificationState & NotificationAction
>()(
  devtools(
    (set) => ({
      surveyRequests: [],
      surveyResponses: [],
      chatRequests: [],
      setSurveyRequests: (ids) =>
        set(
          () => ({
            surveyRequests: ids,
          }),
          false,
          "notifications/setSurveyRequests",
        ),

      setSurveyResponses: (ids) =>
        set(
          () => ({
            surveyResponses: ids,
          }),
          false,
          "notifications/setSurveyResponses",
        ),
      setChatRequests: (ids) =>
        set(
          () => ({
            chatRequests: ids,
          }),
          false,
          "notifications/setChatRequests",
        ),
      reset: () =>
        set(
          () => ({
            surveyRequests: [],
            surveyResponses: [],
            chatRequests: [],
          }),
          false,
          "notifications/reset",
        ),
    }),
    {
      name: "Notification Store",
    },
  ),
);
