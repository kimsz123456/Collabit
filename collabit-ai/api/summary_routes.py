from flask import Blueprint, jsonify
from database.mongodb import mongodb
from services.chat_service import chat_service
import json
from collections import Counter


summary_bp = Blueprint('summary', __name__)


@summary_bp.route("/ai/portfolio/essay/wordcloud", methods=["GET"])
def get_wordcloud():
  try:
    # Get user_code from JWT
    user_code = "57b6a621-9e43-4389-83b7-249b7b5ab929"
    # decode_jwt_from_cookie()

    # 데이터 가져오기
    summaries = list(mongodb.summary_collection.find({"user_code": user_code}))

    strength_keywords = []
    weakness_keywords = []

    # 각 문서에서 키워드 추출
    for summary in summaries:
      for analysis in summary.get('sentiment_analysis', []):
        # 키워드 문자열을 리스트로 변환
        keywords = [k.strip() for k in analysis['keyword'].split(',')]

        # sensitive 값에 따라 키워드 분류
        if analysis['sensitive'] == 'positive':
          strength_keywords.extend(keywords)
        elif analysis['sensitive'] == 'negative':
          weakness_keywords.extend(keywords)

    # 키워드 빈도수 계산
    strength_counter = Counter(strength_keywords)
    weakness_counter = Counter(weakness_keywords)

    # 워드클라우드 형식으로 변환
    strength_cloud = [{"text": word, "value": count}
                      for word, count in strength_counter.items()]
    weakness_cloud = [{"text": word, "value": count}
                      for word, count in weakness_counter.items()]

    return jsonify({
      "strength": strength_cloud,
      "weakness": weakness_cloud
    }), 200

  except Exception as e:
    return jsonify({"error": str(e)}), 500

@summary_bp.route("/ai/portfolio", methods=["POST"])
def get_ai_summary():
    try:
      user_code = "57b6a621-9e43-4389-83b7-249b7b5ab929"
      # decode_jwt_from_cookie()

      summaries = list(
        mongodb.summary_collection.find({"user_code": user_code}))

      strength_answers = []
      weakness_answers = []

      # 답변들을 긍정/부정으로 분류
      for summary in summaries:
        for analysis in summary.get('sentiment_analysis', []):
          if analysis['sensitive'] == 'positive':
            strength_answers.append(analysis['answer'])
          elif analysis['sensitive'] == 'negative':
            weakness_answers.append(analysis['answer'])

      # AI에게 요약 요청
      summary_messages = [
        chat_service.create_message("system", """주어진 답변들을 종합적으로 분석하여 해당 사람의 강점과 약점을 간단명료하게 요약해주세요. 
  답변을 다음과 같은 JSON 형식으로 작성해주세요:
  {
      "strength": "강점에 대한 종합적인 요약",
      "weakness": "약점에 대한 종합적인 요약"
  }"""),
        chat_service.create_message("user", f"""강점 관련 답변들:
  {' // '.join(strength_answers)}

  약점 관련 답변들:
  {' // '.join(weakness_answers)}""")
      ]

      analysis_stream = chat_service.generate_response(summary_messages)
      analysis_response = []

      for chunk in analysis_stream:
        if chunk.choices[0].delta.content:
          analysis_response.append(chunk.choices[0].delta.content)

      ai_analysis = json.loads(''.join(analysis_response))
      mongodb.save_ai_analysis(user_code, ai_analysis)
      return "", 200

    except Exception as e:
      return jsonify({"error": str(e)}), 500


@summary_bp.route("/ai/portfolio/essay/ai-summary", methods=["GET"])
def get_summary():
  try:
    user_code = "57b6a621-9e43-4389-83b7-249b7b5ab929"
    # decode_jwt_from_cookie()

    summary = mongodb.ai_analysis.find_one(
        {"user_code": user_code},
        {"_id": 0, "analysis_results": 1}
    )

    if summary:
      return jsonify(summary["analysis_results"]), 200
    return jsonify({"error": "Summary not found"}), 404

  except Exception as e:
    return jsonify({"error": str(e)}), 500