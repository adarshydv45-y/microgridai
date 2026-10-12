# Multi-stage Dockerfile for MicrogridAI
# Single-container production deployment for Google Cloud Run

# ================= Stage 1: Build Frontend =================
FROM node:20-slim AS frontend-builder
WORKDIR /build

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ================= Stage 2: Production Python Backend =================
FROM python:3.11-slim AS runner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ /app/backend/
COPY --from=frontend-builder /build/dist /app/frontend/dist

WORKDIR /app/backend
RUN python -m app.ml.train_models

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
