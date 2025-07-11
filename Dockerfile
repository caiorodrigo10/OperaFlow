# Simple Railway Dockerfile for OperaFlow
FROM node:20-slim

WORKDIR /app

# Install system dependencies for both Python and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-full \
    curl \
    git \
    build-essential \
    libffi-dev \
    libssl-dev \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install uv using the recommended method with --break-system-packages
RUN pip3 install --break-system-packages uv

# Copy and install frontend dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
ENV NODE_ENV=production
ENV NEXT_PUBLIC_VERCEL_ENV=production
RUN npm run build

# Setup backend
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend

# Install Python dependencies using uv
RUN uv sync

# Create supervisor configuration
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:backend]\n\
command=uv run api.py\n\
directory=/app/backend\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/backend.err.log\n\
stdout_logfile=/var/log/supervisor/backend.out.log\n\
environment=PYTHONPATH="/app/backend",PYTHONUNBUFFERED="1"\n\
\n\
[program:frontend]\n\
command=npm run start\n\
directory=/app/frontend\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/frontend.err.log\n\
stdout_logfile=/var/log/supervisor/frontend.out.log\n\
environment=NODE_ENV="production",PORT="3000"\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create log directories
RUN mkdir -p /var/log/supervisor

# Environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV PORT=3000

# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8000/api/health && curl -f http://localhost:3000 || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 