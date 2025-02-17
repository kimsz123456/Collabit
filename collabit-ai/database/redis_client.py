import redis
import json
from datetime import datetime
from config.settings import REDIS_URL, SESSION_TIMEOUT

class RedisClient:
    def __init__(self):
        self.client = redis.from_url(REDIS_URL)

    def store_survey_info(self, session_id, survey_code, user_code, nickname):
        """Store survey information in Redis"""
        survey_info = {
            "surveyCode": survey_code,
            "userCode": user_code,
            "nickname": nickname,
            "startTime": datetime.now().isoformat()
        }
        self.client.setex(
            f"survey_info_{session_id}",
            SESSION_TIMEOUT,
            json.dumps(survey_info)
        )

    def store_messages(self, session_id, messages):
        """Store messages in Redis"""
        self.client.setex(
            f"messages_{session_id}",
            SESSION_TIMEOUT,
            json.dumps(messages)
        )

    def get_messages(self, session_id):
        """Get messages from Redis"""
        messages_json = self.client.get(f"messages_{session_id}")
        return json.loads(messages_json) if messages_json else None

    def update_response_count(self, project_user_code, survey_code, user_code):
        """Update survey response count"""
        response_count_key = f"newSurveyResponse::{project_user_code}::{survey_code}::{user_code}"
        current_count = self.client.get(response_count_key)
        if current_count:
            self.client.set(response_count_key, int(current_count) + 1)
        else:
            self.client.set(response_count_key, 1)

    def cleanup_session(self, session_id):
        """Clean up session data"""
        self.client.delete(f"messages_{session_id}", f"survey_info_{session_id}")

# Create a singleton instance
redis_client = RedisClient()