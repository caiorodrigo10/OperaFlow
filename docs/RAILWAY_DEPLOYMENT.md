# OperaFlow Railway Deployment Guide

This guide walks you through deploying OperaFlow to Railway, a modern cloud platform that makes deploying applications simple and fast.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Railway Setup](#railway-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Railway, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your OperaFlow code should be in a GitHub repository
3. **Required API Keys**: Collect all necessary API keys (see Environment Configuration)
4. **Supabase Project**: Set up and configured (see main README for details)

## Railway Setup

### 1. Create a New Project

1. Log in to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your OperaFlow repository
5. Railway will automatically detect the project and start the initial deployment

### 2. Add Redis Service

OperaFlow requires Redis for caching and session management:

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "Redis"
3. Railway will provision a Redis instance
4. Note the connection details (automatically available as environment variables)

## Environment Configuration

### 1. Required Environment Variables

Copy the variables from `railway.env.example` and configure them in Railway:

1. Go to your project dashboard
2. Click on your main service
3. Navigate to the "Variables" tab
4. Add each environment variable

### 2. Critical Variables

**Database (Supabase)**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Redis (Auto-configured by Railway)**:
```
REDIS_HOST=${{REDIS.RAILWAY_PRIVATE_DOMAIN}}
REDIS_PORT=${{REDIS.RAILWAY_TCP_PROXY_PORT}}
REDIS_PASSWORD=${{REDIS.REDIS_PASSWORD}}
```

**LLM Provider (at least one required)**:
```
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
MODEL_TO_USE=anthropic/claude-3-5-sonnet-20241022
```

**Search & Web Scraping**:
```
TAVILY_API_KEY=your-tavily-key
FIRECRAWL_API_KEY=your-firecrawl-key
```

**Background Jobs**:
```
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-qstash-signing-key
QSTASH_NEXT_SIGNING_KEY=your-qstash-next-signing-key
```

**Agent Execution**:
```
DAYTONA_API_KEY=your-daytona-key
DAYTONA_PROFILE_ID=your-daytona-profile-id
```

**Frontend Configuration**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-app.railway.app/api
NEXT_PUBLIC_URL=https://your-app.railway.app
NEXT_PUBLIC_ENV_MODE=PRODUCTION
```

### 3. Railway-Specific Variables

```
PORT=3000
RAILWAY_ENVIRONMENT=production
ENV_MODE=production
```

## Deployment Process

### 1. Automatic Deployment

Railway automatically deploys when you push to your connected GitHub repository:

1. Make sure all environment variables are configured
2. Push your code to the main branch
3. Railway will automatically build and deploy
4. Monitor the deployment in the Railway dashboard

### 2. Manual Deployment

You can also trigger manual deployments:

1. Go to your project dashboard
2. Click on your service
3. Navigate to "Deployments"
4. Click "Deploy Latest"

### 3. Custom Dockerfile

The project includes `Dockerfile.railway` optimized for Railway deployment:

- Multi-stage build for efficiency
- Combined frontend and backend in a single container
- Health checks configured
- Optimized for Railway's infrastructure

## Post-Deployment Configuration

### 1. Domain Setup

1. In Railway dashboard, go to your service
2. Navigate to "Settings" → "Domains"
3. Add a custom domain or use the Railway-provided domain
4. Update your environment variables with the new domain:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-domain.com/api
   NEXT_PUBLIC_URL=https://your-domain.com
   WEBHOOK_BASE_URL=https://your-domain.com
   ```

### 2. SSL Certificate

Railway automatically provides SSL certificates for all deployments.

### 3. Health Checks

The deployment includes health checks at `/api/health`. Railway will automatically monitor your application health.

## Monitoring and Logs

### 1. Application Logs

View logs in real-time:

1. Go to your service in Railway dashboard
2. Click "Logs" tab
3. Filter by service (frontend/backend) if needed

### 2. Metrics

Railway provides built-in metrics:

- CPU usage
- Memory usage
- Network traffic
- Response times

### 3. Alerts

Set up alerts for:

- High error rates
- High response times
- Resource usage thresholds

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are properly specified
   - Verify Dockerfile syntax
   - Check build logs for specific errors

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names for typos
   - Verify API keys are valid

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if basejump schema is exposed
   - Ensure Supabase allows connections from Railway IPs

4. **Redis Connection Issues**
   - Verify Redis service is running
   - Check Redis environment variables
   - Ensure Redis service is in the same project

5. **API Integration Issues**
   - Verify all API keys are valid and have proper permissions
   - Check API rate limits
   - Ensure webhook URLs are accessible

### Debugging Steps

1. **Check Logs**:
   ```bash
   # View recent logs
   railway logs
   
   # Follow logs in real-time
   railway logs --follow
   ```

2. **Environment Variables**:
   ```bash
   # List all environment variables
   railway variables
   ```

3. **Service Status**:
   ```bash
   # Check service status
   railway status
   ```

### Performance Optimization

1. **Resource Allocation**:
   - Monitor CPU and memory usage
   - Upgrade plan if needed
   - Optimize application performance

2. **Caching**:
   - Leverage Redis for caching
   - Implement proper cache strategies
   - Monitor cache hit rates

3. **Database Optimization**:
   - Optimize Supabase queries
   - Use proper indexes
   - Monitor database performance

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Community**: [Discord](https://discord.gg/railway)
- **OperaFlow Issues**: [GitHub Issues](https://github.com/caiorodrigo10/OperaFlow/issues)

## Cost Optimization

Railway offers:
- **Hobby Plan**: $5/month with generous limits
- **Pro Plan**: $20/month with higher limits
- **Usage-based pricing**: Pay only for what you use

Monitor your usage in the Railway dashboard to optimize costs.

---

## Quick Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/OperaFlow)

This button will automatically:
1. Create a new Railway project
2. Set up Redis service
3. Deploy OperaFlow
4. Provide environment variable setup guide

**Note**: You'll still need to configure environment variables manually after deployment. 