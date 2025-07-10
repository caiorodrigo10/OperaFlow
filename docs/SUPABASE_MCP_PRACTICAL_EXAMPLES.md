# Guia Prático: Supabase MCP - 6 Ações Essenciais

Este documento fornece exemplos práticos de como usar as 6 ações do Supabase MCP com base no schema real do banco de dados Suna.

## 📋 Visão Geral das Ações

1. **SUPABASE-SELECT-ROW** - Consultar dados
2. **SUPABASE-INSERT-ROW** - Inserir novos dados
3. **SUPABASE-UPDATE-ROW** - Atualizar dados existentes
4. **SUPABASE-UPSERT-ROW** - Inserir ou atualizar (se existir)
5. **SUPABASE-DELETE-ROW** - Deletar dados
6. **SUPABASE-REMOTE-PROCEDURE-CALL** - Chamar funções do banco

---

## 1. 🔍 SUPABASE-SELECT-ROW

### Exemplo 1: Listar todos os agentes de um usuário
```json
{
  "action": "SUPABASE-SELECT-ROW",
  "parameters": {
    "table": "agents",
    "columns": ["agent_id", "name", "description", "is_default", "created_at"],
    "filters": {
      "account_id": "eq.123e4567-e89b-12d3-a456-426614174000"
    },
    "order": [{"column": "created_at", "ascending": false}]
  }
}
```

### Exemplo 2: Buscar mensagens de uma thread específica
```json
{
  "action": "SUPABASE-SELECT-ROW",
  "parameters": {
    "table": "messages",
    "columns": ["message_id", "type", "content", "created_at", "agent_id"],
    "filters": {
      "thread_id": "eq.456e7890-e89b-12d3-a456-426614174001"
    },
    "order": [{"column": "created_at", "ascending": true}],
    "limit": 50
  }
}
```

### Exemplo 3: Contar agentes ativos
```json
{
  "action": "SUPABASE-SELECT-ROW",
  "parameters": {
    "table": "agents",
    "columns": ["count"],
    "filters": {
      "account_id": "eq.123e4567-e89b-12d3-a456-426614174000",
      "is_default": "eq.true"
    },
    "count": "exact"
  }
}
```

---

## 2. ➕ SUPABASE-INSERT-ROW

### Exemplo 1: Criar um novo agente
```json
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "agents",
    "data": {
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Assistente de Vendas",
      "description": "Agente especializado em vendas e atendimento ao cliente",
      "system_prompt": "Você é um assistente de vendas experiente...",
      "configured_mcps": ["supabase", "gmail"],
      "tags": ["vendas", "atendimento", "crm"],
      "is_default": false
    }
  }
}
```

### Exemplo 2: Adicionar entrada na base de conhecimento
```json
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "knowledge_base_entries",
    "data": {
      "thread_id": "456e7890-e89b-12d3-a456-426614174001",
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Política de Devoluções",
      "description": "Informações sobre política de devoluções da empresa",
      "content": "Nossa política permite devoluções em até 30 dias...",
      "usage_context": "contextual",
      "is_active": true
    }
  }
}
```

### Exemplo 3: Criar uma nova thread
```json
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "threads",
    "data": {
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "project_id": "789e1234-e89b-12d3-a456-426614174002",
      "agent_id": "abc12345-e89b-12d3-a456-426614174003",
      "is_public": false,
      "metadata": {
        "agent_builder_mode": false,
        "initial_context": "Conversa sobre vendas"
      }
    }
  }
}
```

---

## 3. ✏️ SUPABASE-UPDATE-ROW

### Exemplo 1: Atualizar configurações de um agente
```json
{
  "action": "SUPABASE-UPDATE-ROW",
  "parameters": {
    "table": "agents",
    "filters": {
      "agent_id": "eq.abc12345-e89b-12d3-a456-426614174003"
    },
    "data": {
      "description": "Agente atualizado com novas funcionalidades",
      "configured_mcps": ["supabase", "gmail", "slack"],
      "tags": ["vendas", "atendimento", "crm", "slack"],
      "updated_at": "now()"
    }
  }
}
```

### Exemplo 2: Marcar entrada de KB como inativa
```json
{
  "action": "SUPABASE-UPDATE-ROW",
  "parameters": {
    "table": "knowledge_base_entries",
    "filters": {
      "entry_id": "eq.def67890-e89b-12d3-a456-426614174004"
    },
    "data": {
      "is_active": false,
      "updated_at": "now()"
    }
  }
}
```

### Exemplo 3: Atualizar status de execução de workflow
```json
{
  "action": "SUPABASE-UPDATE-ROW",
  "parameters": {
    "table": "workflow_executions",
    "filters": {
      "id": "eq.ghi90123-e89b-12d3-a456-426614174005"
    },
    "data": {
      "status": "completed",
      "completed_at": "now()",
      "duration_seconds": 45.2,
      "output_data": {
        "result": "success",
        "processed_items": 10
      }
    }
  }
}
```

---

## 4. 🔄 SUPABASE-UPSERT-ROW

### Exemplo 1: Criar ou atualizar perfil de credenciais MCP
```json
{
  "action": "SUPABASE-UPSERT-ROW",
  "parameters": {
    "table": "user_mcp_credential_profiles",
    "data": {
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "mcp_qualified_name": "supabase",
      "profile_name": "production",
      "display_name": "Supabase Produção",
      "encrypted_config": "encrypted_config_string_here",
      "config_hash": "hash_of_config",
      "is_active": true,
      "is_default": true,
      "last_used_at": "now()"
    },
    "on_conflict": "account_id,mcp_qualified_name,profile_name"
  }
}
```

### Exemplo 2: Atualizar ou criar configuração de trigger
```json
{
  "action": "SUPABASE-UPSERT-ROW",
  "parameters": {
    "table": "agent_triggers",
    "data": {
      "agent_id": "abc12345-e89b-12d3-a456-426614174003",
      "trigger_type": "slack",
      "name": "Notificações de Vendas",
      "description": "Trigger para notificações no Slack",
      "is_active": true,
      "config": {
        "webhook_url": "https://hooks.slack.com/...",
        "channel": "#vendas",
        "conditions": ["new_lead", "deal_closed"]
      }
    },
    "on_conflict": "agent_id,trigger_type,name"
  }
}
```

---

## 5. 🗑️ SUPABASE-DELETE-ROW

### Exemplo 1: Deletar mensagens antigas de uma thread
```json
{
  "action": "SUPABASE-DELETE-ROW",
  "parameters": {
    "table": "messages",
    "filters": {
      "thread_id": "eq.456e7890-e89b-12d3-a456-426614174001",
      "created_at": "lt.2024-01-01T00:00:00Z"
    }
  }
}
```

### Exemplo 2: Remover agente e suas dependências
```json
{
  "action": "SUPABASE-DELETE-ROW",
  "parameters": {
    "table": "agents",
    "filters": {
      "agent_id": "eq.abc12345-e89b-12d3-a456-426614174003",
      "account_id": "eq.123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### Exemplo 3: Limpar logs antigos
```json
{
  "action": "SUPABASE-DELETE-ROW",
  "parameters": {
    "table": "knowledge_base_usage_log",
    "filters": {
      "used_at": "lt.2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 6. 🔧 SUPABASE-REMOTE-PROCEDURE-CALL

### Exemplo 1: Chamar função para buscar estatísticas do agente
```json
{
  "action": "SUPABASE-REMOTE-PROCEDURE-CALL",
  "parameters": {
    "function_name": "get_agent_stats",
    "parameters": {
      "agent_id": "abc12345-e89b-12d3-a456-426614174003",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    }
  }
}
```

### Exemplo 2: Executar limpeza de dados antigos
```json
{
  "action": "SUPABASE-REMOTE-PROCEDURE-CALL",
  "parameters": {
    "function_name": "cleanup_old_data",
    "parameters": {
      "days_to_keep": 90,
      "tables_to_clean": ["messages", "agent_runs", "trigger_events"]
    }
  }
}
```

### Exemplo 3: Calcular métricas de uso
```json
{
  "action": "SUPABASE-REMOTE-PROCEDURE-CALL",
  "parameters": {
    "function_name": "calculate_usage_metrics",
    "parameters": {
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "period": "monthly"
    }
  }
}
```

---

## 🎯 Casos de Uso Práticos Completos

### Caso 1: Criar um agente completo com configurações
```json
// 1. Criar o agente
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "agents",
    "data": {
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Suporte Técnico",
      "description": "Agente especializado em suporte técnico",
      "system_prompt": "Você é um especialista em suporte técnico...",
      "configured_mcps": ["supabase", "github"],
      "tags": ["suporte", "técnico", "bugs"]
    }
  }
}

// 2. Adicionar conhecimento específico
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "agent_knowledge_base_entries",
    "data": {
      "agent_id": "novo_agent_id_aqui",
      "account_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Procedimentos de Troubleshooting",
      "content": "1. Verificar logs...\n2. Testar conectividade...",
      "source_type": "manual",
      "usage_context": "always"
    }
  }
}

// 3. Configurar trigger para GitHub
{
  "action": "SUPABASE-INSERT-ROW",
  "parameters": {
    "table": "agent_triggers",
    "data": {
      "agent_id": "novo_agent_id_aqui",
      "trigger_type": "github",
      "name": "Issues Automatizadas",
      "config": {
        "webhook_url": "https://api.github.com/repos/...",
        "events": ["issues.opened", "issues.labeled"]
      }
    }
  }
}
```

### Caso 2: Monitorar e atualizar execuções
```json
// 1. Buscar execuções em andamento
{
  "action": "SUPABASE-SELECT-ROW",
  "parameters": {
    "table": "workflow_executions",
    "columns": ["id", "status", "started_at", "workflow_id"],
    "filters": {
      "status": "eq.running",
      "started_at": "lt.now() - interval '1 hour'"
    }
  }
}

// 2. Atualizar execuções que travaram
{
  "action": "SUPABASE-UPDATE-ROW",
  "parameters": {
    "table": "workflow_executions",
    "filters": {
      "status": "eq.running",
      "started_at": "lt.now() - interval '1 hour'"
    },
    "data": {
      "status": "failed",
      "error_message": "Timeout - execução cancelada automaticamente",
      "completed_at": "now()"
    }
  }
}
```

---

## 🔍 Dicas Importantes

### Filtros Comuns
- `eq.valor` - Igual a
- `neq.valor` - Diferente de
- `gt.valor` - Maior que
- `gte.valor` - Maior ou igual
- `lt.valor` - Menor que
- `lte.valor` - Menor ou igual
- `like.%padrão%` - Contém padrão
- `in.(valor1,valor2)` - Está na lista
- `is.null` - É nulo
- `not.is.null` - Não é nulo

### Ordenação
```json
"order": [
  {"column": "created_at", "ascending": false},
  {"column": "name", "ascending": true}
]
```

### Paginação
```json
"limit": 10,
"offset": 20
```

### Joins (usando expand)
```json
"expand": ["agent_id(name,description)", "account_id(email)"]
```

---

## ⚠️ Considerações de Segurança

1. **RLS (Row Level Security)**: Todas as tabelas têm RLS habilitado
2. **Validação de account_id**: Sempre incluir account_id nos filtros
3. **Sanitização**: Dados vindos do usuário devem ser validados
4. **Auditoria**: Operações críticas são logadas automaticamente

---

## 📚 Recursos Adicionais

- [Documentação oficial do Supabase](https://supabase.com/docs)
- [PostgREST API Reference](https://postgrest.org/en/stable/api.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

Este guia fornece uma base sólida para usar o Supabase MCP de forma eficiente e segura! 