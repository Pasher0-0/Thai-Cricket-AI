FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
# Install system deps needed by audio libraries (libsndfile for soundfile, ffmpeg for pydub)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   build-essential \
	   gcc \
	   libsndfile1 \
	   ffmpeg \
	&& rm -rf /var/lib/apt/lists/* \
	&& pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]