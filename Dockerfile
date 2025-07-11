# Simple Railway Dockerfile for OperaFlow
FROM node:20-slim

WORKDIR /app

# Install essential dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    git \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip3 install --break-system-packages uv

# Backend setup
COPY backend/ ./backend/
WORKDIR /app/backend
RUN uv sync --frozen

# Frontend setup
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend

# Install and build frontend
RUN npm ci
RUN npm install sharp @tailwindcss/postcss
RUN npm run build

# Copy nginx config
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf

# Simple supervisor config
RUN printf '[supervisord]\nnodaemon=true\n\n[program:backend]\ncommand=uv run uvicorn api:app --host 0.0.0.0 --port 8000\ndirectory=/app/backend\nautostart=true\n\n[program:frontend]\ncommand=npm run start\ndirectory=/app/frontend\nautostart=true\n\n[program:nginx]\ncommand=/usr/sbin/nginx -g "daemon off;"\nautostart=true\n' > /etc/supervisor/conf.d/supervisord.conf

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 