import json

from flask import Blueprint, request, jsonify, Response
from database.mongodb import mongodb
from database.mysql import MySQL
from database.redis_client import redis_client
from auth.jwt_handler import decode_jwt_from_cookie
from services.chat_service import chat_service
from services.stream_service import stream_service

survey_bp = Blueprint('survey', __name__)

@survey_bp.route("/ai/survey/<survey_code>", methods=["POST"])
def start_survey(survey_code):
    try:
        user_code = decode_jwt_from_cookie()
        data = request.json
        nickname = data.get("nickname")

        if not nickname:
            return jsonify({"error": "Nickname is required"}), 401

        if not mongodb.check_survey_multiple_exists(survey_code, user_code):
            return jsonify({"error": "Survey_Multiple is not found"}), 403
        if mongodb.check_survey_essay_exists(survey_code, user_code):
            return jsonify({"error": "Survey_Essay already exists"}), 403
        session_id = f"{survey_code}_{user_code}"

        # Store survey info in Redis
        redis_client.store_survey_info(session_id, survey_code, user_code, nickname)

        # Initialize messages
        messages = [
            chat_service.create_message("system", chat_service.get_system_prompt(nickname)),
            chat_service.create_message("user", "설문을 시작하겠습니다.")
        ]

        def generate():
            try:
                stream = chat_service.generate_response(messages)
                complete_response = []

                # Stream 처리
                for sse_message in stream_service.process_stream(stream):
                    if '"error"' not in sse_message:  # 에러가 아닌 경우만 응답 수집
                        response_data = json.loads(sse_message.replace('data: ', '').strip())
                        complete_response.append(response_data['response'])
                    yield sse_message

                # 전체 응답 저장
                bot_reply = ''.join(complete_response)
                messages.append(chat_service.create_message("assistant", bot_reply))
                redis_client.store_messages(session_id, messages)

            except Exception as e:
                yield stream_service.format_sse_message(str(e), error=True)

        return Response(generate(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@survey_bp.route("/ai/survey/<survey_code>/essay", methods=["POST"])
def chat_survey(survey_code):
    try:
        user_code = decode_jwt_from_cookie()
        session_id = f"{survey_code}_{user_code}"
        content = request.json.get("content")

        if not content:
            return jsonify({"error": "Content is required"}), 400

        # Get messages from Redis
        messages = redis_client.get_messages(session_id)
        if not messages:
            return jsonify({"error": "Survey session not found or expired"}), 404

        messages.append(chat_service.create_message("user", content))

        def generate():
            try:
                stream = chat_service.generate_response(messages)
                complete_response = []

                # Stream 처리
                for sse_message in stream_service.process_stream(stream):
                    if '"error"' not in sse_message:  # 에러가 아닌 경우만 응답 수집
                        response_data = json.loads(sse_message.replace('data: ', '').strip())
                        complete_response.append(response_data['response'])
                    yield sse_message

                # 전체 응답 저장
                bot_reply = ''.join(complete_response)
                messages.append(chat_service.create_message("assistant", bot_reply))
                redis_client.store_messages(session_id, messages)

                if "설문을 종료합니다" in bot_reply:
                    try:
                        yield stream_service.create_pending_message()
                        # Save to MongoDB

                        mongodb.save_survey(survey_code, user_code, messages)

                        # 먼저 완료 메시지를 클라이언트에 보냄
                        yield stream_service.create_completion_message()

                        # Get project owner's user_code from MySQL
                        project_user_code = MySQL.get_project_user_code(
                            survey_code)
                        if project_user_code:
                            # Update response count in Redis
                            redis_client.update_response_count(
                                project_user_code, survey_code)

                            # HuggingFace 요청 및 저장 로직
                            summary_messages = messages.copy()
                            summary_messages.append(
                                chat_service.create_message("user",
                                                            chat_service.get_sentiment_analysis_prompt()))

                            summary_stream = chat_service.generate_response(
                                summary_messages)
                            summary_response = []

                            for chunk in summary_stream:
                                if chunk.choices[0].delta.content:
                                    summary_response.append(
                                        chunk.choices[0].delta.content)
                            analysis_results = json.loads(
                                ''.join(summary_response))
                            summary_data = {
                                "user_code": project_user_code,
                                "sentiment_analysis": analysis_results
                            }

                            # Save to MongoDB summaries collection
                            mongodb.summary_collection.insert_one(summary_data)

                        # Clean up Redis
                        redis_client.cleanup_session(session_id)

                    except Exception as e:
                        yield stream_service.format_sse_message(str(e), error=True)

            except Exception as e:
                yield stream_service.format_sse_message(str(e), error=True)

        return Response(generate(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500