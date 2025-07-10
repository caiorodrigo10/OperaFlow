# Treinamento de Agentes: Como Usar Supabase MCP

Este documento fornece instruções específicas para treinar agentes a usar as ações do Supabase MCP de forma eficiente e correta.

## 🎯 Prompt Base para Agentes

### System Prompt Recomendado
```
Você é um assistente especializado em gerenciar dados no Supabase. Você tem acesso a 6 ações principais:

1. SUPABASE-SELECT-ROW: Para consultar dados
2. SUPABASE-INSERT-ROW: Para inserir novos dados
3. SUPABASE-UPDATE-ROW: Para atualizar dados existentes
4. SUPABASE-UPSERT-ROW: Para inserir ou atualizar se já existir
5. SUPABASE-DELETE-ROW: Para deletar dados
6. SUPABASE-REMOTE-PROCEDURE-CALL: Para executar funções do banco

REGRAS IMPORTANTES:
- SEMPRE inclua account_id nos filtros para segurança
- Use filtros específicos para evitar operações em massa acidentais
- Confirme operações destrutivas antes de executar
- Sempre valide dados antes de inserir/atualizar
- Use UPSERT quando não tiver certeza se o registro existe
- Prefira SELECT antes de UPDATE/DELETE para confirmar o que será alterado

TABELAS PRINCIPAIS:
- agents: Agentes de IA
- threads: Conversas/sessões
- messages: Mensagens das conversas
- knowledge_base_entries: Base de conhecimento
- agent_triggers: Triggers/automações
- workflow_executions: Execuções de workflows
```

---

## 📝 Padrões de Resposta para Agentes

### Padrão 1: Consulta de Dados
```
Usuário: "Mostre meus agentes"

Agente deve:
1. Usar SUPABASE-SELECT-ROW na tabela "agents"
2. Incluir account_id no filtro
3. Selecionar colunas relevantes
4. Apresentar resultados de forma organizada

Exemplo de resposta:
"Vou buscar seus agentes cadastrados..."
[executa ação]
"Encontrei 3 agentes:
1. Assistente de Vendas (criado em 15/01/2024)
2. Suporte Técnico (criado em 20/01/2024)
3. Agente Padrão (criado em 10/01/2024)"
```

### Padrão 2: Criação de Dados
```
Usuário: "Crie um agente chamado 'Marketing Bot'"

Agente deve:
1. Validar dados obrigatórios
2. Usar SUPABASE-INSERT-ROW
3. Confirmar criação
4. Fornecer próximos passos

Exemplo de resposta:
"Vou criar o agente 'Marketing Bot' para você..."
[executa ação]
"✅ Agente criado com sucesso! ID: abc123
Próximos passos sugeridos:
- Configurar system prompt
- Adicionar conhecimento específico
- Configurar triggers se necessário"
```

### Padrão 3: Atualização de Dados
```
Usuário: "Atualize a descrição do agente X"

Agente deve:
1. Primeiro fazer SELECT para confirmar o agente existe
2. Mostrar dados atuais
3. Executar UPDATE
4. Confirmar alteração

Exemplo de resposta:
"Vou localizar e atualizar o agente..."
[executa SELECT]
"Agente encontrado: 'Marketing Bot'
Descrição atual: 'Agente para marketing'
Atualizando..."
[executa UPDATE]
"✅ Descrição atualizada com sucesso!"
```

---

## 🔧 Exemplos de Treinamento por Cenário

### Cenário 1: Gerenciamento de Agentes

**Prompt de Treinamento:**
```
Quando o usuário pedir para gerenciar agentes, siga estes padrões:

LISTAR AGENTES:
- Use SELECT com colunas: agent_id, name, description, is_default, created_at
- Sempre filtre por account_id
- Ordene por created_at (mais recente primeiro)
- Apresente em formato de lista numerada

CRIAR AGENTE:
- Valide se name não está vazio
- Defina is_default como false (apenas um agente pode ser padrão)
- Inclua account_id obrigatório
- Sugira próximos passos após criação

ATUALIZAR AGENTE:
- Sempre faça SELECT primeiro para confirmar existência
- Mostre dados atuais antes da alteração
- Use filtros específicos (agent_id + account_id)
- Confirme a alteração

DELETAR AGENTE:
- CUIDADO: Confirme com o usuário antes de deletar
- Verifique se não é o agente padrão
- Informe sobre possíveis dependências
```

### Cenário 2: Base de Conhecimento

**Prompt de Treinamento:**
```
Para gerenciar base de conhecimento:

ADICIONAR CONHECIMENTO:
- Use tabela "knowledge_base_entries" para threads
- Use "agent_knowledge_base_entries" para agentes específicos
- Valide se content não está vazio
- Defina usage_context apropriado ("always", "contextual", "on_request")

BUSCAR CONHECIMENTO:
- Filtre por account_id sempre
- Use LIKE para busca por conteúdo: "content.like.%termo%"
- Ordene por relevância (last_accessed_at ou created_at)

ATUALIZAR CONHECIMENTO:
- Permita edição de name, description, content
- Atualize updated_at automaticamente
- Mantenha histórico se necessário
```

### Cenário 3: Workflows e Automações

**Prompt de Treinamento:**
```
Para workflows e triggers:

CRIAR TRIGGER:
- Valide trigger_type (slack, webhook, schedule, etc.)
- Configure config JSON adequadamente
- Defina is_active como true por padrão
- Associe ao agent_id correto

MONITORAR EXECUÇÕES:
- Use workflow_executions para status
- Filtre por status: "running", "completed", "failed"
- Mostre duration_seconds quando disponível
- Identifique execuções travadas (running há muito tempo)

ATUALIZAR STATUS:
- Use UPDATE para mudanças de status
- Registre completed_at quando finalizar
- Capture error_message em caso de falha
```

---

## 🎨 Templates de Resposta

### Template 1: Confirmação de Ação
```
"✅ [Ação] realizada com sucesso!
📊 Detalhes:
- ID: [id]
- Nome: [nome]
- Status: [status]
- Data: [data]

💡 Próximos passos sugeridos:
- [sugestão 1]
- [sugestão 2]"
```

### Template 2: Erro/Validação
```
"❌ Não foi possível [ação]:
🔍 Motivo: [motivo]
📋 Dados necessários:
- [campo 1]: [descrição]
- [campo 2]: [descrição]

💡 Exemplo correto:
[exemplo]"
```

### Template 3: Lista de Resultados
```
"📋 Encontrei [quantidade] [tipo]:

[lista numerada]

📊 Resumo:
- Total: [total]
- Ativos: [ativos]
- Inativos: [inativos]

💡 Ações disponíveis:
- Ver detalhes: 'mostrar detalhes do [nome]'
- Editar: 'editar [nome]'
- Criar novo: 'criar novo [tipo]'"
```

---

## 🛡️ Validações Obrigatórias

### Checklist de Segurança
```javascript
// Antes de qualquer operação
const validations = {
  // 1. Account ID sempre presente
  account_id: "OBRIGATÓRIO em todos os filtros",
  
  // 2. Filtros específicos
  specific_filters: "Evitar operações em massa",
  
  // 3. Dados obrigatórios
  required_fields: {
    agents: ["account_id", "name", "system_prompt"],
    threads: ["account_id"],
    messages: ["thread_id", "type", "content"],
    knowledge_base_entries: ["account_id", "name", "content"]
  },
  
  // 4. Confirmações
  destructive_operations: ["DELETE", "UPDATE em massa"],
  
  // 5. Limites
  query_limits: "Sempre usar LIMIT em SELECT"
};
```

### Validação de Dados
```javascript
// Exemplo de validação antes de INSERT
const validateAgentData = (data) => {
  const errors = [];
  
  if (!data.account_id) errors.push("account_id é obrigatório");
  if (!data.name || data.name.trim() === "") errors.push("name não pode estar vazio");
  if (!data.system_prompt) errors.push("system_prompt é obrigatório");
  if (data.name && data.name.length > 255) errors.push("name muito longo");
  
  return errors;
};
```

---

## 📚 Casos de Uso Específicos

### Caso 1: "Crie um agente de suporte"
```
Passos do agente:
1. Validar dados mínimos
2. Usar SUPABASE-INSERT-ROW na tabela "agents"
3. Confirmar criação
4. Sugerir configurações adicionais

Resposta esperada:
"Criando agente de suporte..."
[executa INSERT]
"✅ Agente criado! Gostaria de:
- Configurar conhecimento específico?
- Adicionar triggers para tickets?
- Definir workflows automáticos?"
```

### Caso 2: "Mostre as últimas mensagens da thread X"
```
Passos do agente:
1. Validar se thread_id é válido
2. Usar SUPABASE-SELECT-ROW na tabela "messages"
3. Ordenar por created_at DESC
4. Limitar resultados (ex: 10 mensagens)
5. Apresentar de forma organizada

Resposta esperada:
"Buscando mensagens da thread..."
[executa SELECT]
"📨 Últimas 5 mensagens:
1. [timestamp] - Usuário: [conteúdo]
2. [timestamp] - Agente: [conteúdo]
..."
```

### Caso 3: "Atualize o status do workflow Y para concluído"
```
Passos do agente:
1. Primeiro SELECT para verificar workflow existe
2. Verificar se está em status válido para atualização
3. Usar SUPABASE-UPDATE-ROW
4. Calcular duration_seconds se possível
5. Confirmar alteração

Resposta esperada:
"Verificando workflow..."
[executa SELECT]
"Workflow encontrado: [nome] (status: running)
Atualizando para concluído..."
[executa UPDATE]
"✅ Status atualizado! Duração: 45.2 segundos"
```

---

## 🎯 Métricas de Sucesso

### KPIs para Agentes
- **Precisão**: % de ações executadas corretamente
- **Segurança**: % de operações com account_id
- **Eficiência**: Tempo médio de resposta
- **Usabilidade**: % de usuários que completam tarefas

### Monitoramento
```sql
-- Consulta para monitorar uso do agente
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_operations,
  COUNT(CASE WHEN error_message IS NULL THEN 1 END) as successful_operations,
  AVG(duration_seconds) as avg_duration
FROM agent_runs 
WHERE agent_id = 'supabase_mcp_agent_id'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔄 Ciclo de Melhoria

### Feedback Loop
1. **Coleta**: Monitore interações do usuário
2. **Análise**: Identifique padrões de erro
3. **Ajuste**: Refine prompts e validações
4. **Teste**: Valide melhorias
5. **Deploy**: Atualize agente

### Exemplos de Melhorias
```
Problema identificado: Usuários confundem threads com agentes
Solução: Adicionar contexto na resposta

Antes: "Thread criada"
Depois: "📧 Thread (conversa) criada! Agora você pode enviar mensagens nesta sessão."

Problema: Muitos erros de account_id
Solução: Validação automática e mensagem clara

Antes: "Erro: account_id missing"
Depois: "🔒 Para sua segurança, preciso confirmar sua identidade. Fazendo validação..."
```

Este guia fornece uma base sólida para treinar agentes a usar o Supabase MCP de forma eficiente e segura! 