import { sendMultipleSurveyAnswerAPI } from "@/shared/api/survey";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const useSendMultipleAnswer = ({ nickname }: { nickname: string }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: sendMultipleAnswer } = useMutation({
    mutationFn: ({
      surveyCode,
      answer,
    }: {
      surveyCode: number;
      answer: number[];
    }) => sendMultipleSurveyAnswerAPI(surveyCode, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveyList", nickname] });
    },
  });

  return { sendMultipleAnswer };
};

export default useSendMultipleAnswer;
