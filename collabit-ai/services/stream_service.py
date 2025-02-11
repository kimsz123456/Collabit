import json
from datetime import datetime
from typing import Generator


class StreamService:
  BUFFER_SIZE = 10  # 버퍼 크기 설정

  @staticmethod
  def process_stream(stream) -> Generator[str, None, None]:
    """
    Stream을 처리하고 버퍼링된 응답을 생성
    """
    try:
      buffer = []
      buffer_char_count = 0

      for chunk in stream:
        if chunk.choices[0].delta.content:
          content = chunk.choices[0].delta.content
          buffer.append(content)
          buffer_char_count += len(content)

          # 버퍼가 일정 크기에 도달하거나 특정 구두점을 만나면 flush
          if (buffer_char_count >= StreamService.BUFFER_SIZE or
              any(mark in content for mark in ['.', '?', '!', '\n'])):
            buffered_content = ''.join(buffer)
            if buffered_content.strip():
              yield StreamService.format_sse_message(buffered_content)
            buffer = []
            buffer_char_count = 0

      # 남은 버퍼 처리
      if buffer:
        buffered_content = ''.join(buffer)
        if buffered_content.strip():
          yield StreamService.format_sse_message(buffered_content)

    except Exception as e:
      yield StreamService.format_sse_message(str(e), error=True)

  @staticmethod
  def format_sse_message(content: str, error: bool = False) -> str:
    """
    SSE 메시지 포맷 생성
    """
    data = {
      "status": "incompleted",
      "timestamp": datetime.now().isoformat()
    }

    if error:
      data["error"] = content
    else:
      data["response"] = content

    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

  @staticmethod
  def create_pending_message() -> str:
    """
    설문 완료 메시지 생성
    """
    data = {
      "status": "pending",
      "timestamp": datetime.now().isoformat(),
      "response": "저장중입니다."
    }
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

  @staticmethod
  def create_completion_message() -> str:
    """
    설문 완료 메시지 생성
    """
    data = {
      "status": "completed",
      "timestamp": datetime.now().isoformat(),
      "response": "설문이 완료되었습니다."
    }
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


stream_service = StreamService()