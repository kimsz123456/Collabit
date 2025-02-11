from dotenv import load_dotenv
import os
import base64

# Load environment variables
load_dotenv()

# Flask settings
FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY')

# JWT settings
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# Database settings
MONGODB_URI = os.getenv('SPRING_DATA_MONGODB_URI')
MYSQL_HOST = os.getenv('SPRING_DATASOURCE_URL').split('/')[-2].split(':')[0]
MYSQL_DB = os.getenv('SPRING_DATASOURCE_URL').split('/')[-1]
MYSQL_USER = os.getenv('SPRING_DATASOURCE_USERNAME')
MYSQL_PASSWORD = os.getenv('SPRING_DATASOURCE_PASSWORD')

# Redis settings
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
SESSION_TIMEOUT = 3600  # 1 hour

# Hugging Face settings
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

# AI Model settings
MODEL_NAME = os.getenv('HUGGINGFACE_MODEL_NAME')
MODEL_TEMPERATURE = 0.5
MODEL_MAX_TOKENS = 2048
MODEL_TOP_P = 0.7


def get_decoded_jwt_secret():
  def fix_base64_padding(s):
    missing_padding = len(s) % 4
    if missing_padding:
      s += '=' * (4 - missing_padding)
    return s

  return base64.b64decode(fix_base64_padding(JWT_SECRET_KEY))