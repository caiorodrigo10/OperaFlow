# 🚀 Guia de Deploy no Railway - OperaFlow

## 📋 Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Projeto configurado no Supabase**
3. **APIs necessárias configuradas** (OpenAI, Anthropic, etc.)

## 🔧 Configuração de Variáveis de Ambiente

### **Variáveis OBRIGATÓRIAS**

```bash
# Environment Mode
ENV_MODE=production

# Database (Supabase) - OBRIGATÓRIO
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# LLM Provider (pelo menos um) - OBRIGATÓRIO
ANTHROPIC_API_KEY=sua-chave-anthropic
# OU
OPENAI_API_KEY=sua-chave-openai

# Search APIs - OBRIGATÓRIO
TAVILY_API_KEY=sua-chave-tavily
FIRECRAWL_API_KEY=sua-chave-firecrawl

# Agent Execution - OBRIGATÓRIO
DAYTONA_API_KEY=sua-chave-daytona
DAYTONA_SERVER_URL=https://seu-servidor-daytona.com
DAYTONA_TARGET=seu-target-daytona

# Background Jobs - OBRIGATÓRIO
QSTASH_TOKEN=seu-token-qstash
QSTASH_CURRENT_SIGNING_KEY=sua-chave-assinatura-atual
QSTASH_NEXT_SIGNING_KEY=sua-chave-assinatura-proxima

# Frontend - AUTO-CONFIGURADO pelo Railway
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
NEXT_PUBLIC_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_ENV_MODE=PRODUCTION
```

### **Variáveis do Redis (Railway Redis Add-on)**

Se você adicionar o Redis add-on do Railway:

```bash
REDIS_HOST=${{REDIS.RAILWAY_PRIVATE_DOMAIN}}
REDIS_PORT=${{REDIS.RAILWAY_TCP_PROXY_PORT}}
REDIS_PASSWORD=${{REDIS.REDIS_PASSWORD}}
REDIS_SSL=false
```

### **Variáveis Opcionais**

```bash
# Stripe (para billing)
STRIPE_SECRET_KEY=sua-chave-secreta-stripe
STRIPE_WEBHOOK_SECRET=seu-webhook-secret

# Monitoring
SENTRY_DSN=seu-dsn-sentry

# Outros LLM providers
GROQ_API_KEY=sua-chave-groq
XAI_API_KEY=sua-chave-xai
OPENROUTER_API_KEY=sua-chave-openrouter

# Admin
ADMIN_API_KEY=sua-chave-admin-personalizada
```

## 🚀 Passos para Deploy

### 1. **Preparar o Repositório**
```bash
git add .
git commit -m "Configuração otimizada para Railway"
git push origin main
```

### 2. **Criar Projeto no Railway**
1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha seu repositório OperaFlow

### 3. **Configurar Variáveis de Ambiente**
1. No dashboard do Railway, vá para a aba "Variables"
2. Adicione TODAS as variáveis obrigatórias listadas acima
3. **IMPORTANTE**: Use os valores reais, não os placeholders

### 4. **Adicionar Redis (Recomendado)**
1. No dashboard, clique em "Add Service"
2. Selecione "Redis"
3. As variáveis do Redis serão configuradas automaticamente

### 5. **Verificar Deploy**
1. O deploy iniciará automaticamente
2. Monitore os logs na aba "Deployments"
3. Aguarde o health check passar em `/api/health`

## 🔍 Verificação de Funcionamento

### **Health Checks**
- **Backend**: `https://seu-app.railway.app/api/health`
- **Frontend**: `https://seu-app.railway.app/`

### **Logs Importantes**
```bash
# Logs do Backend
[program:backend] Starting FastAPI application
[program:backend] Redis connection initialized successfully

# Logs do Frontend  
[program:frontend] Next.js application ready
[program:frontend] Server running on port 3000

# Logs do Nginx
[program:nginx] nginx started successfully
```

## ⚠️ Problemas Comuns e Soluções

### **1. Build Failed - Variáveis Faltando**
**Erro**: `Missing required configuration fields`
**Solução**: Verificar se todas as variáveis obrigatórias estão configuradas

### **2. Health Check Failed**
**Erro**: `Health check timeout`
**Solução**: 
- Verificar se o backend está rodando na porta 8000
- Conferir logs do supervisor

### **3. Frontend não carrega**
**Erro**: Página em branco ou 502
**Solução**:
- Verificar se `NEXT_PUBLIC_*` variáveis estão configuradas
- Conferir se o build do Next.js foi bem-sucedido

### **4. Redis Connection Failed**
**Erro**: `Failed to initialize Redis connection`
**Solução**:
- Adicionar Redis add-on no Railway
- Verificar variáveis `REDIS_*`

## 📊 Monitoramento

### **Métricas Importantes**
- **CPU Usage**: < 80%
- **Memory Usage**: < 1GB
- **Response Time**: < 2s para `/api/health`

### **Logs para Monitorar**
```bash
# Supervisor status
supervisorctl status

# Nginx access logs
tail -f /var/log/supervisor/nginx.out.log

# Backend API logs
tail -f /var/log/supervisor/backend.out.log
```

## 🔄 Updates e Manutenção

### **Deploy de Updates**
1. Push para `main` branch
2. Railway fará redeploy automaticamente
3. Verificar health checks após deploy

### **Rollback se Necessário**
1. No Railway dashboard → "Deployments"
2. Clique em deployment anterior funcionando
3. "Redeploy"

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs no Railway dashboard
2. Conferir todas as variáveis de ambiente
3. Testar health check: `/api/health`
4. Verificar documentação do Railway: [docs.railway.app](https://docs.railway.app) 