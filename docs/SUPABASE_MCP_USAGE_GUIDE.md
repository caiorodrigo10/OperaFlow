# Guia Prático: Supabase MCP Actions

Este documento explica como usar as actions do Supabase MCP (Model Context Protocol) na prática, com exemplos detalhados para cada operação.

## Configuração Inicial

Antes de usar as actions, você precisa configurar o MCP do Supabase no seu agente:

```json
{
  "qualifiedName": "supabase",
  "name": "Supabase Database",
  "config": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseKey": "your-anon-key-or-service-role-key"
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

## Actions Disponíveis

### 0. DESCOBERTA DE SCHEMA (Exploração do Banco)
**Descrição**: Quando você não conhece a estrutura do banco, use estas estratégias para descobrir tabelas e colunas.

#### Exemplo 1: Listar Todas as Tabelas
```javascript
// Descobrir quais tabelas existem no banco
{
  "table": "information_schema.tables",
  "columns": "table_name, table_type",
  "filters": {
    "table_schema": "public",
    "table_type": "BASE TABLE"
  },
  "order": {"table_name": "asc"}
}

// Resultado:
[
  {"table_name": "users", "table_type": "BASE TABLE"},
  {"table_name": "products", "table_type": "BASE TABLE"},
  {"table_name": "orders", "table_type": "BASE TABLE"},
  {"table_name": "order_items", "table_type": "BASE TABLE"},
  {"table_name": "categories", "table_type": "BASE TABLE"}
]
```

#### Exemplo 2: Descobrir Estrutura de uma Tabela
```javascript
// Após encontrar a tabela "users", descobrir suas colunas
{
  "table": "information_schema.columns",
  "columns": "column_name, data_type, is_nullable, column_default",
  "filters": {
    "table_schema": "public",
    "table_name": "users"
  },
  "order": {"ordinal_position": "asc"}
}

// Resultado:
[
  {"column_name": "id", "data_type": "bigint", "is_nullable": "NO", "column_default": "nextval('users_id_seq'::regclass)"},
  {"column_name": "name", "data_type": "text", "is_nullable": "YES", "column_default": null},
  {"column_name": "email", "data_type": "text", "is_nullable": "NO", "column_default": null},
  {"column_name": "created_at", "data_type": "timestamp with time zone", "is_nullable": "YES", "column_default": "now()"},
  {"column_name": "active", "data_type": "boolean", "is_nullable": "YES", "column_default": "true"}
]
```

#### Exemplo 3: Exploração Inteligente com Amostra de Dados
```javascript
// Após descobrir a estrutura, pegar uma amostra dos dados
{
  "table": "users",
  "columns": "*",
  "limit": 3
}

// Resultado:
[
  {"id": 1, "name": "João Silva", "email": "joao@email.com", "created_at": "2024-01-15T10:00:00Z", "active": true},
  {"id": 2, "name": "Maria Santos", "email": "maria@email.com", "created_at": "2024-01-16T14:30:00Z", "active": true},
  {"id": 3, "name": "Carlos Lima", "email": "carlos@email.com", "created_at": "2024-01-17T09:15:00Z", "active": false}
]
```

#### Exemplo 4: Descobrir Relacionamentos (Foreign Keys)
```javascript
// Encontrar relacionamentos entre tabelas
{
  "table": "information_schema.key_column_usage",
  "columns": "table_name, column_name, referenced_table_name, referenced_column_name",
  "filters": {
    "table_schema": "public",
    "referenced_table_name": {"is": "not null"}
  }
}

// Resultado:
[
  {"table_name": "orders", "column_name": "user_id", "referenced_table_name": "users", "referenced_column_name": "id"},
  {"table_name": "order_items", "column_name": "order_id", "referenced_table_name": "orders", "referenced_column_name": "id"},
  {"table_name": "order_items", "column_name": "product_id", "referenced_table_name": "products", "referenced_column_name": "id"}
]
```

### 1. SUPABASE-SELECT-ROW
**Descrição**: Seleciona linhas de uma tabela do banco de dados.

#### Exemplo Básico:
```javascript
// Selecionar todos os usuários
{
  "table": "users",
  "columns": "*"
}

// Resultado:
[
  {"id": 1, "name": "João", "email": "joao@email.com", "created_at": "2024-01-15T10:00:00Z"},
  {"id": 2, "name": "Maria", "email": "maria@email.com", "created_at": "2024-01-16T14:30:00Z"}
]
```

#### Exemplo com Filtros:
```javascript
// Selecionar usuários ativos criados após uma data
{
  "table": "users",
  "columns": "id, name, email",
  "filters": {
    "active": true,
    "created_at": {"gte": "2024-01-01T00:00:00Z"}
  },
  "order": {"created_at": "desc"},
  "limit": 10
}
```

#### Exemplo com Joins:
```javascript
// Selecionar usuários com seus pedidos
{
  "table": "users",
  "columns": "*, orders(id, total, created_at)",
  "filters": {
    "orders.status": "completed"
  }
}
```

### 2. SUPABASE-INSERT-ROW
**Descrição**: Insere uma nova linha na tabela.

#### Exemplo Básico:
```javascript
// Inserir um novo usuário
{
  "table": "users",
  "data": {
    "name": "Carlos Silva",
    "email": "carlos@email.com",
    "age": 30,
    "active": true
  }
}

// Resultado:
{
  "id": 3,
  "name": "Carlos Silva",
  "email": "carlos@email.com",
  "age": 30,
  "active": true,
  "created_at": "2024-01-17T09:15:00Z"
}
```

#### Exemplo com Retorno Específico:
```javascript
// Inserir e retornar apenas o ID
{
  "table": "products",
  "data": {
    "name": "Notebook Dell",
    "price": 2500.00,
    "category": "electronics"
  },
  "select": "id, name"
}
```

### 3. SUPABASE-BATCH-INSERT-ROWS
**Descrição**: Insere múltiplas linhas de uma vez (mais eficiente para grandes volumes).

#### Exemplo Prático:
```javascript
// Inserir múltiplos produtos
{
  "table": "products",
  "data": [
    {
      "name": "iPhone 15",
      "price": 4999.00,
      "category": "smartphones",
      "stock": 50
    },
    {
      "name": "Samsung Galaxy S24",
      "price": 4499.00,
      "category": "smartphones", 
      "stock": 30
    },
    {
      "name": "MacBook Pro",
      "price": 8999.00,
      "category": "laptops",
      "stock": 15
    }
  ]
}

// Resultado:
[
  {"id": 101, "name": "iPhone 15", "price": 4999.00, ...},
  {"id": 102, "name": "Samsung Galaxy S24", "price": 4499.00, ...},
  {"id": 103, "name": "MacBook Pro", "price": 8999.00, ...}
]
```

### 4. SUPABASE-UPDATE-ROW
**Descrição**: Atualiza linhas existentes na tabela.

#### Exemplo Básico:
```javascript
// Atualizar dados de um usuário específico
{
  "table": "users",
  "data": {
    "name": "João Santos",
    "age": 32,
    "updated_at": "2024-01-17T10:30:00Z"
  },
  "filters": {
    "id": 1
  }
}
```

#### Exemplo com Múltiplos Filtros:
```javascript
// Atualizar status de pedidos pendentes
{
  "table": "orders",
  "data": {
    "status": "processing",
    "updated_at": "2024-01-17T11:00:00Z"
  },
  "filters": {
    "status": "pending",
    "created_at": {"gte": "2024-01-01T00:00:00Z"}
  }
}
```

### 5. SUPABASE-UPSERT-ROW
**Descrição**: Atualiza uma linha se ela existir, ou insere uma nova se não existir.

#### Exemplo Prático:
```javascript
// Upsert de configurações do usuário
{
  "table": "user_settings",
  "data": {
    "user_id": 1,
    "theme": "dark",
    "notifications": true,
    "language": "pt-BR"
  },
  "onConflict": "user_id",
  "ignoreDuplicates": false
}

// Se user_id=1 já existe: atualiza os campos
// Se user_id=1 não existe: cria novo registro
```

#### Exemplo com Múltiplos Registros:
```javascript
// Upsert de inventário de produtos
{
  "table": "inventory",
  "data": [
    {"product_id": 101, "quantity": 25, "location": "warehouse_A"},
    {"product_id": 102, "quantity": 40, "location": "warehouse_B"},
    {"product_id": 103, "quantity": 10, "location": "warehouse_A"}
  ],
  "onConflict": "product_id,location"
}
```

### 6. SUPABASE-DELETE-ROW
**Descrição**: Remove linhas da tabela.

#### Exemplo Básico:
```javascript
// Deletar um usuário específico
{
  "table": "users",
  "filters": {
    "id": 3
  }
}
```

#### Exemplo com Múltiplos Filtros:
```javascript
// Deletar pedidos antigos e cancelados
{
  "table": "orders",
  "filters": {
    "status": "cancelled",
    "created_at": {"lt": "2023-12-31T23:59:59Z"}
  }
}
```

### 7. SUPABASE-REMOTE-PROCEDURE-CALL
**Descrição**: Executa uma função PostgreSQL personalizada.

#### Exemplo de Função Simples:
```javascript
// Chamar função que calcula total de vendas
{
  "function": "calculate_monthly_sales",
  "parameters": {
    "month": 1,
    "year": 2024
  }
}

// Resultado:
{
  "total_sales": 125000.50,
  "total_orders": 1250,
  "average_order": 100.00
}
```

#### Exemplo de Função Complexa:
```javascript
// Chamar função que gera relatório de usuários
{
  "function": "generate_user_report",
  "parameters": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "include_inactive": false
  }
}
```

## Casos de Uso Práticos

### 0. Descoberta e Exploração de Banco Desconhecido

#### Cenário: Agente explora um banco pela primeira vez
```javascript
// PASSO 1: Descobrir que tabelas existem
{
  "table": "information_schema.tables",
  "columns": "table_name, table_type",
  "filters": {
    "table_schema": "public",
    "table_type": "BASE TABLE"
  },
  "order": {"table_name": "asc"}
}

// PASSO 2: Para cada tabela interessante, descobrir estrutura
// Exemplo: explorando a tabela "products"
{
  "table": "information_schema.columns",
  "columns": "column_name, data_type, is_nullable, column_default",
  "filters": {
    "table_schema": "public",
    "table_name": "products"
  },
  "order": {"ordinal_position": "asc"}
}

// PASSO 3: Pegar amostra dos dados para entender o conteúdo
{
  "table": "products",
  "columns": "*",
  "limit": 5
}

// PASSO 4: Contar registros para entender o volume
{
  "table": "products",
  "columns": "count(*) as total_products"
}

// PASSO 5: Descobrir valores únicos em colunas categóricas
{
  "table": "products",
  "columns": "category, count(*) as count",
  "group_by": ["category"],
  "order": {"count": "desc"}
}
```

#### Exemplo de Resposta do Agente:
```
🔍 Explorando o banco de dados...

📋 **Tabelas encontradas:**
- users (usuários)
- products (produtos) 
- orders (pedidos)
- order_items (itens do pedido)
- categories (categorias)

📊 **Estrutura da tabela 'products':**
- id (bigint, chave primária)
- name (text, nome do produto)
- price (numeric, preço)
- category (text, categoria)
- stock (integer, estoque)
- created_at (timestamp, data de criação)

💾 **Dados de exemplo:**
1. iPhone 15 - R$ 4.999,00 (categoria: smartphones, estoque: 50)
2. MacBook Pro - R$ 8.999,00 (categoria: laptops, estoque: 15)
3. AirPods - R$ 1.299,00 (categoria: accessories, estoque: 100)

📈 **Resumo:**
- Total de produtos: 1.250
- Categorias principais: smartphones (300), laptops (150), accessories (200)

Agora posso ajudar você com consultas específicas neste banco!
```

### 1. Sistema de E-commerce

#### Criar um Pedido Completo:
```javascript
// 1. Inserir o pedido
{
  "table": "orders",
  "data": {
    "user_id": 1,
    "total": 299.99,
    "status": "pending"
  }
}

// 2. Inserir itens do pedido
{
  "table": "order_items",
  "data": [
    {"order_id": 1001, "product_id": 101, "quantity": 2, "price": 149.99},
    {"order_id": 1001, "product_id": 102, "quantity": 1, "price": 149.99}
  ]
}

// 3. Atualizar estoque
{
  "table": "products",
  "data": {"stock": {"decrement": 2}},
  "filters": {"id": 101}
}
```

### 2. Sistema de Blog

#### Buscar Posts com Autor:
```javascript
// Selecionar posts com informações do autor
{
  "table": "posts",
  "columns": "*, authors(name, avatar)",
  "filters": {
    "published": true,
    "created_at": {"gte": "2024-01-01T00:00:00Z"}
  },
  "order": {"created_at": "desc"},
  "limit": 10
}
```

### 3. Sistema de Usuários

#### Atualizar Perfil Completo:
```javascript
// Upsert de perfil do usuário
{
  "table": "user_profiles",
  "data": {
    "user_id": 1,
    "bio": "Desenvolvedor Full Stack",
    "location": "São Paulo, SP",
    "website": "https://meusite.com",
    "skills": ["JavaScript", "Python", "React"]
  },
  "onConflict": "user_id"
}
```

## Dicas e Melhores Práticas

### 1. **Performance**
- Use `BATCH-INSERT-ROWS` para inserir múltiplos registros
- Sempre especifique colunas específicas em `SELECT` quando possível
- Use índices apropriados nas colunas de filtro

### 2. **Segurança**
- Sempre valide dados antes de inserir/atualizar
- Use RLS (Row Level Security) no Supabase
- Nunca exponha chaves de service_role no frontend

### 3. **Tratamento de Erros**
```javascript
// Exemplo de tratamento de erro
try {
  const result = await supabase_insert_row({
    "table": "users",
    "data": {"email": "email@exemplo.com"}
  });
} catch (error) {
  if (error.code === "23505") {
    // Violação de constraint única
    console.log("Email já existe");
  }
}
```

### 4. **Paginação**
```javascript
// Implementar paginação
{
  "table": "posts",
  "columns": "*",
  "order": {"created_at": "desc"},
  "limit": 20,
  "offset": 40  // Página 3 (20 * 2)
}
```

## Exemplos de Prompts para Agentes

### Para Descoberta de Schema:
```
"Explore este banco de dados e me mostre que tabelas existem"

"Quais são as principais tabelas deste sistema e como elas se relacionam?"

"Me mostre a estrutura da tabela X com alguns dados de exemplo"

"Quais colunas a tabela Y possui e quais são os tipos de dados?"

"Descubra quantos registros cada tabela tem"

"Analise o banco e me dê um resumo da estrutura do sistema"
```

### Para Consultas:
```
"Busque todos os usuários ativos que se cadastraram nos últimos 30 dias, ordenados por data de criação"

"Encontre os 10 produtos mais vendidos no mês passado com suas quantidades"
```

### Para Inserções:
```
"Cadastre um novo cliente com nome 'João Silva', email 'joao@email.com' e telefone '11999999999'"

"Adicione estes produtos ao estoque: iPhone 15 (50 unidades), Samsung Galaxy (30 unidades)"
```

### Para Atualizações:
```
"Atualize o status de todos os pedidos pendentes para 'em processamento'"

"Marque como inativo todos os usuários que não fizeram login nos últimos 6 meses"
```

Este guia deve ajudar os agentes a entender como usar cada action do Supabase MCP de forma eficiente e prática. 