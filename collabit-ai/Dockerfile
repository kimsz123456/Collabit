FROM python:3.12-alpine

WORKDIR /app

RUN apk add --no-cache build-base

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn  # Gunicorn 추가

COPY . .

EXPOSE 5000

# 타임존 설정
ENV TZ=Asia/Seoul

CMD ["gunicorn", "--timeout", "300","--workers", "3", "-b", "0.0.0.0:5000", "app:app"]