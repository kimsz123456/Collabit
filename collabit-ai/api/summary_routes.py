from flask import Blueprint, jsonify
from database.mongodb import mongodb
from services.chat_service import chat_service
import json
from collections import Counter
from auth.jwt_handler import decode_jwt_from_cookie


summary_bp = Blueprint('summary', __name__)


@summary_bp.route("/ai/portfolio", methods=["POST"])
def get_ai_summary():
  try:
    user_code = decode_jwt_from_cookie()

    summaries = list(mongodb.get_summary_by_user(user_code))

    strength_answers = []
    weakness_answers = []
    strength_keywords = []
    weakness_keywords = []

    # 답변들과 키워드를 긍정/부정으로 분류
    for summary in summaries:
      for analysis in summary.get('sentiment_analysis', []):
        if analysis['sensitive'] == 'positive':
          strength_answers.append(analysis['answer'])
          keywords = [k.strip() for k in analysis['keyword'].split(',')]
          strength_keywords.extend(keywords)
        elif analysis['sensitive'] == 'negative':
          weakness_answers.append(analysis['answer'])
          keywords = [k.strip() for k in analysis['keyword'].split(',')]
          weakness_keywords.extend(keywords)

    # AI 요약 요청
    summary_messages = [
      chat_service.create_message("system", """분석 결과를 JSON 형식으로 반환해야 합니다.
    중괄호나 다른 서식 없이 정확히 다음 형식으로만 응답하세요:
    {
        "strength": "강점에 대한 종합적인 요약",
        "weakness": "약점에 대한 종합적인 요약"
    }
    추가 설명이나 다른 텍스트를 포함하지 마세요."""),
      chat_service.create_message("user", f"""강점 관련 답변들:
    {' // '.join(strength_answers)}

    약점 관련 답변들:
    {' // '.join(weakness_answers)}

    위 답변들을 분석하여 정확히 JSON 형식으로만 응답해주세요.""")
    ]

    analysis_stream = chat_service.generate_response(summary_messages)
    analysis_response = []

    for chunk in analysis_stream:
      if chunk.choices[0].delta.content:
        analysis_response.append(chunk.choices[0].delta.content)

    ai_analysis = json.loads(''.join(analysis_response))
    mongodb.save_ai_analysis(user_code, ai_analysis)

    # 워드클라우드 생성 및 저장
    strength_counter = Counter(strength_keywords)
    weakness_counter = Counter(weakness_keywords)

    def normalize_word_cloud(counter, top_n=20, min_value=8, max_value=25):
      most_common = counter.most_common(top_n)

      if not most_common:
        return []

      min_count = min(count for _, count in most_common)
      max_count = max(count for _, count in most_common)

      normalized = []
      for word, count in most_common:
        if min_count == max_count:
          normalized_value = (min_value + max_value) / 2
        else:
          normalized_value = (count - min_count) / (max_count - min_count) * (
              max_value - min_value) + min_value

        normalized.append({
          "text": word,
          "value": round(normalized_value, 1)
        })

      return normalized

    wordcloud_data = {
      "user_code": user_code,
      "strength": normalize_word_cloud(strength_counter),
      "weakness": normalize_word_cloud(weakness_counter),
    }

    # MongoDB에 워드클라우드 데이터 저장
    mongodb.wordcloud_collection.update_one(
        {"user_code": user_code},
        {"$set": wordcloud_data},
        upsert=True
    )

    return "", 200

  except Exception as e:
    return jsonify({"error": str(e)}), 500