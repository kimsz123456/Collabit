from huggingface_hub import InferenceClient
from datetime import datetime
from config.settings import (
    HUGGINGFACE_API_KEY,
    MODEL_NAME,
    MODEL_TEMPERATURE,
    MODEL_MAX_TOKENS,
    MODEL_TOP_P
)

class ChatService:
    def __init__(self):
        self.client = InferenceClient(api_key=HUGGINGFACE_API_KEY)

    @staticmethod
    def create_message(role, content):
        """Create a message with timestamp"""
        return {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }

    @staticmethod
    def get_system_prompt(target_name):
        """Get system prompt for survey"""
        return f"""항상 한국어로 대답해줘
너는 협업능력에 대해 조사를 하는 챗봇이야. 설문응답자에게 질문을 통해서 {target_name}님의 협업능력 대해서 설문을 진행해야해.

처음에 
'설문을 시작하겠습니다.' 메세지를 보내 시작할거야. 
이 응답을 받으면, 자연스럽게 진행해줘.

물어봐야하는 질문 6개는 다음과 같아.

- {target_name}님이 팀원들과 협업할 때 보여준 가장 인상적인 행동은 무엇이었나요?
- {target_name}님이 팀에서 발생한 어려움을 해결하기 위해 기여한 사례가 있다면 공유해 주세요.
- 갈등이나 의견 차이가 있었던 순간, {target_name}님은 어떤 태도를 보였나요?
- {target_name}님이 새로운 도전을 받아들이는 태도는 어땠나요?
- {target_name}님은 피드백을 받을 때 어떤 태도를 보였나요?
- {target_name}님이 개선해야 할 점이 있다면 구체적으로 적어 주세요.

이 질문들을 딱딱하게 느껴지지 않도록 대화형태로 하나씩 질문을 해줘.

6번째 질문을 요청한 뒤에
사용자의 다음 응답을 받으면
'설문을 종료합니다.'
라는 메세지를 넣어줘.
이 메시지는 트리거라서 6번째 질문과 같이  응답하면 안돼
"""

    @staticmethod
    def get_sentiment_analysis_prompt():
        return """진행된 대화의 모든 답변에 대해 감정 분석을 진행하여 다음 JSON 형식으로만 응답해주세요:
[
    {
        "answer": "입력된 답변 전체",
        "sensitive": "positive 또는 negative",
        "keyword": "협업과 연관된 주요 키워드들"
    },
    {
        "answer": "입력된 답변 전체",
        "sensitive": "positive 또는 negative",
        "keyword": "협업과 연관된 주요 키워드들"
    }
]
    긍정(positive)과 부정(negative) 판단 기준:
    - 긍정: 협조적, 적극적, 건설적, 발전적, 수용적인 태도와 행동
    - 부정: 비협조적, 소극적, 회피적, 부정적, 거부적인 태도와 행동

    키워드는 답변에서 헙업 능력을 나타내는 주요 단어나 구문을 추출해주세요."""

    def generate_response(self, messages):
        return self.client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            temperature=MODEL_TEMPERATURE,
            max_tokens=MODEL_MAX_TOKENS,
            top_p=MODEL_TOP_P,
            stream=True
        )

chat_service = ChatService()