# Optimized Railway Dockerfile for OperaFlow
FROM node:20-slim

WORKDIR /app

# Install system dependencies including nginx
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
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python dependency management
RUN pip3 install --break-system-packages uv

# Setup backend first (faster builds on dependency changes)
COPY backend/ ./backend/
WORKDIR /app/backend

# Install Python dependencies
RUN uv sync --frozen

# Setup frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production

# Copy frontend source and build
COPY frontend/ ./
ENV NODE_ENV=production
ENV NEXT_PUBLIC_VERCEL_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set Railway-specific environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=${RAILWAY_PUBLIC_DOMAIN:+https://$RAILWAY_PUBLIC_DOMAIN/api}
ENV NEXT_PUBLIC_URL=${RAILWAY_PUBLIC_DOMAIN:+https://$RAILWAY_PUBLIC_DOMAIN}

# Build frontend
RUN npm run build

# Copy nginx configuration
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf

# Create optimized supervisor configuration with nginx
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
loglevel=info\n\
\n\
[program:backend]\n\
command=uv run uvicorn api:app --host 0.0.0.0 --port 8000\n\
directory=/app/backend\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/backend.err.log\n\
stdout_logfile=/var/log/supervisor/backend.out.log\n\
environment=PYTHONPATH="/app/backend",PYTHONUNBUFFERED="1"\n\
priority=1\n\
\n\
[program:frontend]\n\
command=npm run start\n\
directory=/app/frontend\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/frontend.err.log\n\
stdout_logfile=/var/log/supervisor/frontend.out.log\n\
environment=NODE_ENV="production",PORT="3000"\n\
priority=2\n\
\n\
[program:nginx]\n\
command=/usr/sbin/nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/nginx.err.log\n\
stdout_logfile=/var/log/supervisor/nginx.out.log\n\
priority=3\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create log directories
RUN mkdir -p /var/log/supervisor

# Environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV PORT=${PORT:-8000}

# Expose the main port (Railway will route to this)
EXPOSE ${PORT:-8000}

# Improved health check targeting backend API through nginx
HEALTHCHECK --interval=30s --timeout=15s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 