from pymongo import MongoClient
from config.settings import MONGODB_URI
from datetime import datetime
import certifi
import dns.resolver


class MongoDB:
  def __init__(self):
    # DNS 리졸버 설정
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

    # 연결 옵션 설정
    connection_options = {
      'serverSelectionTimeoutMS': 5000,
      'connectTimeoutMS': 10000,
      'tlsCAFile': certifi.where(),
      'retryWrites': True,
      'w': 'majority'
    }

    try:
      self.client = MongoClient(MONGODB_URI, **connection_options)
      # 연결 테스트
      self.client.admin.command('ping')
      print("MongoDB 연결 성공")

      self.db = self.client['mydatabase']
      self.survey_essay = self.db['survey_essay']
      self.summary_collection = self.db['summaries']
      self.sentiment_analysis = self.db['sentiment_analysis']
      self.survey_multiple = self.db['survey_multiple']
      self.ai_analysis = self.db['ai_analysis']

    except Exception as e:
      print(f"MongoDB connection failed: {e}")
      raise

  def save_survey(self, survey_code, user_code, messages):
    """Save survey data to MongoDB"""
    try:
      survey_data = {
        "submittedAt": datetime.now(),
        "messages": messages,
        "projectInfoCode": int(survey_code),
        "userCode": user_code
      }
      return self.survey_essay.insert_one(survey_data)
    except Exception as e:
      print(f"Failed to save survey: {e}")
      raise

  def save_sentiment_analysis(self, user_code, analysis_results):
    """Save sentiment analysis results to MongoDB"""
    try:
      analysis_data = {
        "user_code": user_code,
        "analysis_results": analysis_results,
        "created_at": datetime.now()
      }
      return self.sentiment_analysis.insert_one(analysis_data)
    except Exception as e:
      print(f"Failed to save sentiment analysis: {e}")
      raise

  def get_survey_by_user(self, user_code):
    """Get survey data by user code"""
    try:
      return self.survey_essay.find({"userCode": user_code})
    except Exception as e:
      print(f"Failed to get survey: {e}")
      raise

  def get_sentiment_analysis_by_user(self, user_code):
    """Get sentiment analysis results by user code"""
    try:
      return self.sentiment_analysis.find({"user_code": user_code})
    except Exception as e:
      print(f"Failed to get sentiment analysis: {e}")
      raise

  def save_summary(self, user_code, summary_data):
    """Save summary data to MongoDB"""
    try:
      summary_doc = {
        "user_code": user_code,
        "summary": summary_data,
        "created_at": datetime.now()
      }
      return self.summary_collection.insert_one(summary_doc)
    except Exception as e:
      print(f"Failed to save summary: {e}")
      raise

  def get_summary_by_user(self, user_code):
    """Get summary data by user code"""
    try:
      return self.summary_collection.find({"user_code": user_code})
    except Exception as e:
      print(f"Failed to get summary: {e}")
      raise

  def check_survey_multiple_exists(self, project_info_code, user_code):
    try:
      result = self.survey_multiple.find_one({
        "projectInfoCode": int(project_info_code),  # survey_code를 정수로 변환
        "userCode": user_code
      })
      return result is not None
    except Exception as e:
      print(f"Failed to check survey: {e}")
      raise

  def check_survey_essay_exists(self, project_info_code, user_code):
    try:
      result = self.survey_essay.find_one({
        "projectInfoCode": int(project_info_code),
        "userCode": user_code
      })
      print(result)
      return result
    except Exception as e:
      print(f"Failed to check survey: {e}")
      raise

    def save_ai_analysis(self, user_code, analysis_results):
        try:
            self.ai_analysis.delete_one({"user_code": user_code})

            analysis_data = {
                "user_code": user_code,
                "analysis_results": analysis_results,
                "created_at": datetime.now()
            }
            return self.ai_analysis.insert_one(analysis_data)
        except Exception as e:
            print(f"Failed to save ai analysis: {e}")
        raise

# Create a singleton instance
mongodb = MongoDB()
