import { sendMultipleSurveyAnswerAPI } from "@/shared/api/survey";
import { useMutation } from "@tanstack/react-query";

const useSendMultipleAnswer = () => {
  const { mutateAsync: sendMultipleAnswer } = useMutation({
    mutationFn: ({
      surveyCode,
      answer,
    }: {
      surveyCode: number;
      answer: number[];
    }) => sendMultipleSurveyAnswerAPI(surveyCode, answer),
  });

  return { sendMultipleAnswer };
};

export default useSendMultipleAnswer;
