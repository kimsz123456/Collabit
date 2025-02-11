import { EssayStatus } from "@/features/survey/ui/SurveyRoom";

interface StreamResponse {
  status: "completed" | "incompleted" | "pending";
  timestamp: string;
  response: string;
}

interface EssaySurveyAPIProps {
  surveyCode: number;
  body: string;
  api: (surveyCode: number, body: string) => Promise<Response>;
  setState: (state: string | ((prevState: string) => string)) => void;
  setStatus: (status: EssayStatus) => void;
}

const essaySurveyAPI = async ({
  surveyCode,
  body,
  api,
  setState,
  setStatus,
}: EssaySurveyAPIProps) => {
  try {
    // 처음엔 READY, 통신중에는 STREAMING, 저장중엔 SAVING, 완료하면 COMPLETED
    setStatus("PENDING");
    const response = await api(surveyCode, body);

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("스트림 리더를 생성할 수 없습니다");
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setStatus("PROGRESSING");
        break;
      }

      const text = decoder.decode(value);
      const lines = text.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.replace("data: ", "");
            const data: StreamResponse = JSON.parse(jsonStr);
            console.log(data);
            setStatus("STREAMING");
            setState((prevState) => prevState + data.response);

            if (data.status === "pending") {
              setStatus("SAVING");
            }
            // status가 completed이면 스트림 종료
            if (data.status === "completed") {
              setStatus("COMPLETED");
              await reader.cancel(); // 스트림 명시적 종료
              return;
            }
          } catch (error) {
            console.error("JSON 파싱 오류:", error);
          }
        }
      }
    }
  } catch (error) {
    setStatus("ERROR");
    throw error;
  }
};

export default essaySurveyAPI;
