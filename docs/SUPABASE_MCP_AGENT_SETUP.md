# Configuração de Agente para Supabase MCP

Este documento mostra como configurar um agente para usar as actions do Supabase MCP corretamente.

## 1. Configuração do Agente

### System Prompt Recomendado:
```markdown
Você é um assistente especializado em gerenciamento de banco de dados Supabase. Você tem acesso às seguintes ferramentas do Supabase MCP:

**FERRAMENTAS DISPONÍVEIS:**
- `supabase_select_row`: Para consultar dados (SELECT)
- `supabase_insert_row`: Para inserir um registro (INSERT)
- `supabase_batch_insert_rows`: Para inserir múltiplos registros
- `supabase_update_row`: Para atualizar registros (UPDATE)
- `supabase_upsert_row`: Para inserir ou atualizar (UPSERT)
- `supabase_delete_row`: Para deletar registros (DELETE)
- `supabase_remote_procedure_call`: Para chamar funções PostgreSQL

**IMPORTANTE:**
- Sempre valide os dados antes de inserir/atualizar
- Use filtros específicos para evitar operações em massa acidentais
- Confirme operações destrutivas (DELETE/UPDATE) antes de executar
- Retorne resultados de forma clara e organizada

**DESCOBERTA DE SCHEMA:**
Quando não souber a estrutura do banco, sempre explore primeiro:
1. Liste tabelas: information_schema.tables
2. Descubra colunas: information_schema.columns  
3. Pegue amostras de dados para entender o conteúdo
4. Identifique relacionamentos entre tabelas

**FORMATO DOS PARÂMETROS:**
Todas as ferramentas esperam parâmetros em formato JSON. Exemplos:

Para SELECT:
{
  "table": "users",
  "columns": "id, name, email",
  "filters": {"active": true},
  "order": {"created_at": "desc"},
  "limit": 10
}

Para INSERT:
{
  "table": "users",
  "data": {
    "name": "João Silva",
    "email": "joao@email.com"
  }
}

Para UPDATE:
{
  "table": "users",
  "data": {"active": false},
  "filters": {"id": 123}
}
```

### Configuração MCP:
```json
{
  "name": "Supabase Database",
  "qualifiedName": "supabase",
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseKey": "your-service-role-key"
  },
  "enabledTools": [
    "supabase_select_row",
    "supabase_insert_row",
    "supabase_batch_insert_rows",
    "supabase_update_row",
    "supabase_upsert_row",
    "supabase_delete_row",
    "supabase_remote_procedure_call"
  ]
}
```

## 2. Exemplos de Uso Correto

### Exemplo 0: Descoberta de Schema
**Prompt do usuário:** "Não conheço este banco, me mostre que tabelas existem"

**Resposta do agente:**
```
Vou explorar o banco de dados para você descobrir sua estrutura.

<function_calls>
<invoke name="supabase_select_row">
<parameter name="table">information_schema.tables</parameter>
<parameter name="columns">table_name, table_type</parameter>
<parameter name="filters">{"table_schema": "public", "table_type": "BASE TABLE"}</parameter>
<parameter name="order">{"table_name": "asc"}</parameter>
</invoke>
</function_calls>

📋 **Tabelas encontradas:**
- categories (categorias)
- order_items (itens de pedidos)
- orders (pedidos)
- products (produtos)
- users (usuários)

Agora vou examinar a estrutura de uma tabela principal:

<function_calls>
<invoke name="supabase_select_row">
<parameter name="table">information_schema.columns</parameter>
<parameter name="columns">column_name, data_type, is_nullable</parameter>
<parameter name="filters">{"table_schema": "public", "table_name": "users"}</parameter>
<parameter name="order">{"ordinal_position": "asc"}</parameter>
</invoke>
</function_calls>

📊 **Estrutura da tabela 'users':**
- id (bigint, obrigatório)
- name (text, opcional)
- email (text, obrigatório)
- created_at (timestamp, opcional)
- active (boolean, opcional)

Quer que eu explore alguma tabela específica ou pegar amostras dos dados?
```

### Exemplo 1: Consultar Usuários
**Prompt do usuário:** "Mostre todos os usuários ativos"

**Resposta do agente:**
```
Vou buscar todos os usuários ativos para você.

<function_calls>
<invoke name="supabase_select_row">
<parameter name="table">users</parameter>
<parameter name="columns">id, name, email, created_at</parameter>
<parameter name="filters">{"active": true}</parameter>
<parameter name="order">{"created_at": "desc"}</parameter>
</invoke>
</function_calls>

Encontrei X usuários ativos:
1. João Silva (joao@email.com) - Cadastrado em 15/01/2024
2. Maria Santos (maria@email.com) - Cadastrado em 16/01/2024
...
```

### Exemplo 2: Inserir Produto
**Prompt do usuário:** "Cadastre um novo produto: iPhone 15, preço R$ 4999, categoria smartphones"

**Resposta do agente:**
```
Vou cadastrar o novo produto para você.

<function_calls>
<invoke name="supabase_insert_row">
<parameter name="table">products</parameter>
<parameter name="data">{
  "name": "iPhone 15",
  "price": 4999.00,
  "category": "smartphones",
  "active": true
}</parameter>
</invoke>
</function_calls>

✅ Produto cadastrado com sucesso!
- ID: 101
- Nome: iPhone 15
- Preço: R$ 4.999,00
- Categoria: smartphones
```

### Exemplo 3: Atualizar Status de Pedidos
**Prompt do usuário:** "Marque todos os pedidos pendentes como 'em processamento'"

**Resposta do agente:**
```
Vou atualizar o status dos pedidos pendentes. Primeiro, deixe-me verificar quantos pedidos serão afetados:

<function_calls>
<invoke name="supabase_select_row">
<parameter name="table">orders</parameter>
<parameter name="columns">count(*)</parameter>
<parameter name="filters">{"status": "pending"}</parameter>
</invoke>
</function_calls>

Encontrei 15 pedidos pendentes. Posso prosseguir com a atualização?

[Após confirmação do usuário]

<function_calls>
<invoke name="supabase_update_row">
<parameter name="table">orders</parameter>
<parameter name="data">{
  "status": "processing",
  "updated_at": "2024-01-17T10:30:00Z"
}</parameter>
<parameter name="filters">{"status": "pending"}</parameter>
</invoke>
</function_calls>

✅ Atualizados 15 pedidos de 'pending' para 'processing'
```

## 3. Casos de Uso Avançados

### Relatório de Vendas Mensal
```markdown
**Prompt:** "Gere um relatório de vendas do mês passado"

**Implementação:**
1. Usar `supabase_remote_procedure_call` para chamar função de relatório
2. Ou fazer múltiplas consultas e processar os dados
3. Formatar resultado de forma clara
```

### Sincronização de Dados
```markdown
**Prompt:** "Sincronize os dados do produto X com o estoque"

**Implementação:**
1. Usar `supabase_select_row` para buscar dados atuais
2. Usar `supabase_upsert_row` para atualizar/inserir
3. Confirmar operação realizada
```

## 4. Tratamento de Erros

### Exemplo de Erro de Constraint:
```
❌ Erro ao inserir usuário: Email já existe no sistema
Detalhes: Violação de constraint única na coluna 'email'
Sugestão: Verifique se o email já está cadastrado ou use upsert
```

### Exemplo de Erro de Permissão:
```
❌ Erro ao acessar tabela: Permissão negada
Detalhes: RLS (Row Level Security) bloqueou a operação
Sugestão: Verifique as políticas de segurança da tabela
```

## 5. Melhores Práticas para Agentes

### 1. Sempre Confirmar Operações Destrutivas
```
⚠️ ATENÇÃO: Você está prestes a deletar 100 registros da tabela 'users'
Tem certeza que deseja continuar? (sim/não)
```

### 2. Mostrar Dados Antes de Atualizar
```
📋 Dados atuais do usuário ID 123:
- Nome: João Silva
- Email: joao@email.com
- Status: ativo

🔄 Novos dados que serão aplicados:
- Nome: João Santos
- Status: inativo

Confirma a atualização? (sim/não)
```

### 3. Usar Paginação para Grandes Resultados
```
📊 Encontrei 1.500 registros. Mostrando os primeiros 20:

[Lista dos 20 primeiros]

💡 Para ver mais resultados, use: "mostrar próximos 20" ou "ir para página X"
```

### 4. Formatar Resultados de Forma Clara
```
✅ Consulta realizada com sucesso!

📈 Resumo:
- Total de registros: 250
- Registros ativos: 200
- Registros inativos: 50

🔝 Top 5 por categoria:
1. Eletrônicos: 80 produtos
2. Roupas: 65 produtos
3. Livros: 45 produtos
...
```

## 6. Debugging e Logs

### Exemplo de Log Detalhado:
```
🔍 Executando consulta:
- Tabela: users
- Filtros: {"active": true, "created_at": {"gte": "2024-01-01"}}
- Ordenação: created_at DESC
- Limite: 10

⏱️ Tempo de execução: 0.45s
✅ Retornados: 8 registros
```

Este guia deve ajudar a configurar agentes que usam o Supabase MCP de forma eficiente e user-friendly. 