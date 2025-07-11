# Simplified Railway Dockerfile for OperaFlow
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-full \
    curl \
    git \
    build-essential \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python dependency management
RUN pip3 install --break-system-packages uv

# Setup backend
COPY backend/ ./backend/
WORKDIR /app/backend
RUN uv sync --frozen

# Setup frontend - Copy everything first
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend

# Install dependencies
RUN npm ci

# Explicitly install sharp and postcss dependencies
RUN npm install sharp @tailwindcss/postcss --save

# Verify project structure and debug path resolution
RUN echo "=== Verifying project structure ===" && \
    pwd && \
    ls -la && \
    echo "=== TypeScript config ===" && \
    cat tsconfig.json && \
    echo "=== Next.js config ===" && \
    cat next.config.ts && \
    echo "=== Source structure ===" && \
    find src -name "*.ts" -o -name "*.tsx" | head -20 && \
    echo "=== Checking specific files ===" && \
    ls -la src/lib/supabase/server.ts && \
    ls -la src/lib/feature-flags.ts && \
    ls -la src/lib/utils/get-agent-style.ts

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_VERCEL_ENV=production

# Try to build with verbose output
RUN npm run build -- --debug

# Copy nginx configuration
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf

# Create supervisor configuration
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

# Expose the main port
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 