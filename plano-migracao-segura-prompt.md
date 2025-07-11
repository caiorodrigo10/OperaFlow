# 🔐 Plano de Migração Segura: Otimização do Prompt de Execução

## 📊 Análise da Situação Atual

### Contexto do Projeto
- **Branch Atual**: `prompt-optimization-20250115` ✅ (já em branch de otimização)
- **Status do Sistema**: 🟢 **PRÉ-LANÇAMENTO** (apenas desenvolvimento)
- **Usuários**: 1 (você - desenvolvedor/owner)
- **Risco Real**: MÉDIO (podemos quebrar e consertar sem impacto em produção)
- **Arquivos Críticos**:
  - `backend/agent/prompt.py` - 655 linhas (Principal)
  - `backend/agent/gemini_prompt.py` - 1748 linhas (Variante Gemini)
  - `backend/agent/agent_builder_prompt.py` - 200 linhas (Criação de agentes)

### Vantagens do Ambiente de Desenvolvimento
- ✅ **Sem usuários em produção** = liberdade para experimentar
- ✅ **Feedback imediato** = você testa na hora
- ✅ **Rollback fácil** = git reset se necessário
- ✅ **Sem SLA** = podemos quebrar temporariamente

---

## 🚀 Estratégia Revisada: "Move Fast and Fix Things"

### Novos Princípios (Modo Dev)
1. **Experimentar rapidamente**
2. **Quebrar está OK** (temporariamente)
3. **Testar em "produção"** (seu ambiente)
4. **Iterar baseado em uso real**
5. **Simplificar o processo**

---

## 📋 Fase 0: Backup Simples (30 minutos)

### 0.1 Backup Rápido
```bash
# Backup simples e direto
cp backend/agent/prompt.py backend/agent/prompt_backup_$(date +%Y%m%d).py
cp backend/agent/gemini_prompt.py backend/agent/gemini_backup_$(date +%Y%m%d).py

# Commit atual estado
git add -A
git commit -m "chore: backup before prompt optimization"
```

### 0.2 Branch de Trabalho (Opcional)
```bash
# Podemos trabalhar direto no branch atual ou criar um novo
git checkout -b prompt-fix-quadrado-branco
```

---

## 🔥 Fase 1: Correções Imediatas (Hoje!)

### 1.1 Fix Direto do "Quadrado Branco"
```python
# Editar diretamente backend/agent/prompt.py
# Localizar seção 7.2 e adicionar após linha ~580:

## 7.2.1 ASK TOOL CRITICAL VALIDATION
- **NEVER call 'ask' with empty text**: The ask tool requires actual content
- **Before using 'ask' tool**:
  1. Verify text parameter is not empty/whitespace
  2. Ensure you have a specific question
  3. Include context about why you're asking
- **Valid examples**:
  ✅ ask("Which database would you prefer: PostgreSQL or MongoDB?")
  ✅ ask("I found 3 issues. Should I fix them all?")
- **Invalid examples**:
  ❌ ask("")
  ❌ ask("   ")
  ❌ ask() with no text
- **If you have nothing to ask, don't use the tool**
```

### 1.2 Fix do Problema de Relatórios Grandes
```python
# Adicionar na seção 6.1 WRITING GUIDELINES:

## 6.1.1 LARGE CONTENT STRATEGY
- **For reports/docs > 1000 lines**: Build incrementally
  1. Create outline first (outline.md)
  2. Write sections separately
  3. Use str-replace to combine
  4. Save progress frequently
- **Never try to write > 50KB in one operation**
- **Example approach**:
  - create-file report_outline.md
  - create-file section1.md (test results 1-5)
  - str-replace to append to main report
  - continue incrementally
```

### 1.3 Fix do String Replace
```python
# Adicionar esclarecimento na seção de ferramentas:

## STR-REPLACE TOOL USAGE
- **EXACT MATCH REQUIRED**: Include ALL whitespace, indentation, line breaks
- **Maximum 20 lines per replacement** for reliability
- **For larger changes**: Use file rewrite instead
- **Common mistakes**:
  ❌ Missing indentation
  ❌ Wrong line breaks
  ❌ Partial matches
```

### 1.4 Testar Imediatamente
```bash
# Reiniciar o backend
cd backend
pkill -f "python api.py"
python api.py

# Testar casos específicos:
# 1. Pedir para documentar algo
# 2. Criar relatório grande
# 3. Editar arquivo com str-replace
```

---

## 🏃‍♂️ Fase 2: Melhorias Rápidas (Amanhã)

### 2.1 Adicionar Chain-of-Thought Básico
```python
# No início da seção 5 (WORKFLOW MANAGEMENT):

## 5.0 THINKING BEFORE ACTING
Before any tool use, think through:
1. What is the user asking?
2. What tools do I need?
3. What could go wrong?
4. How will I verify success?

This thinking helps prevent errors like empty ask calls.
```

### 2.2 Melhorar Estrutura (Sem XML por enquanto)
```python
# Adicionar separadores visuais:

################################################################################
# SECTION 1: CORE IDENTITY & CAPABILITIES
################################################################################

# ... conteúdo ...

################################################################################
# SECTION 2: EXECUTION ENVIRONMENT
################################################################################

# ... etc
```

---

## 🧪 Fase 3: Teste Intensivo (Próximos 2-3 dias)

### 3.1 Casos de Teste Reais
- [ ] Criar documentação complexa
- [ ] Gerar relatório de 20+ itens
- [ ] Editar múltiplos arquivos
- [ ] Tarefas que falhavam antes
- [ ] Workflows completos

### 3.2 Ajustes Baseados em Uso
```python
# Manter um log simples:
# fixes_log.md
- [x] Quadrado branco: Resolvido com validação
- [ ] Relatórios cortados: Testar solução incremental
- [ ] Str-replace failures: Monitorar taxa de erro
```

---

## 🎯 Fase 4: Refatoração Completa (Quando necessário)

### 4.1 Modularização (Se valer a pena)
```python
# Só fazer se o prompt ficar muito complexo
# Por enquanto, manter tudo em um arquivo é mais simples
```

### 4.2 XML Structure (Futuro)
```xml
<!-- Implementar apenas quando tiver múltiplos agentes/usuários -->
<!-- Por enquanto, texto simples é mais fácil de editar -->
```

---

## ⚡ Vantagens da Abordagem Simplificada

1. **Velocidade**: Correções aplicadas em horas, não semanas
2. **Feedback Real**: Você testa imediatamente
3. **Menos Burocracia**: Sem comitês de aprovação
4. **Iteração Rápida**: Ajustar baseado em uso real
5. **Foco no que Importa**: Resolver problemas reais, não teóricos

---

## 📊 Cronograma Acelerado

### Hoje (Dia 1)
- ✅ Backup simples (5 min)
- ✅ Aplicar 3 fixes críticos (30 min)
- ✅ Testar cada fix (1 hora)
- ✅ Ajustar se necessário

### Amanhã (Dia 2)
- Adicionar melhorias de thinking
- Testar casos complexos
- Documentar o que funcionou

### Resto da Semana
- Uso intensivo
- Coletar problemas reais
- Fixes incrementais

### Próxima Semana
- Avaliar se precisa refatoração maior
- Considerar modularização
- Planejar para multi-usuário (se necessário)

---

## 🛠️ Ferramentas Úteis

### Monitor de Erros Simples
```python
# error_monitor.py
import re
from datetime import datetime

def check_logs_for_patterns():
    patterns = {
        'empty_ask': r'ask\(\s*["\']?\s*["\']?\s*\)',
        'str_replace_fail': r'Invalid String Replacement',
        'large_file_fail': r'File too large'
    }
    # Verificar logs e contar ocorrências
```

### Quick Test Script
```bash
#!/bin/bash
# test_prompts.sh

echo "Testing empty ask prevention..."
# Comando que triggava quadrado branco

echo "Testing large report..."
# Comando para relatório grande

echo "Testing str-replace..."
# Comando para edição
```

---

## ✅ Checklist Simplificado

### Imediato
- [ ] Backup do prompt atual
- [ ] Aplicar fix do quadrado branco
- [ ] Aplicar fix de relatórios
- [ ] Aplicar fix de str-replace
- [ ] Testar cada mudança

### Curto Prazo
- [ ] Adicionar thinking básico
- [ ] Melhorar formatação
- [ ] Documentar mudanças
- [ ] Coletar novos problemas

### Longo Prazo (Se necessário)
- [ ] Modularizar prompt
- [ ] Implementar XML
- [ ] Preparar para multi-usuário
- [ ] Sistema de versionamento

---

## 🎯 Métricas de Sucesso (Modo Dev)

1. **Quadrado branco eliminado** ✅
2. **Relatórios completos funcionando** ✅
3. **Str-replace com < 10% de erro** ✅
4. **Você feliz com o agente** ✅
5. **Pronto para mostrar para outros** ✅

---

## 💡 Filosofia Final

> "Como você é o único usuário, cada bug é uma oportunidade de melhoria imediata, não uma crise. Aproveite essa liberdade para experimentar e criar o melhor agente possível!"

### Lembre-se:
- **Não existe "produção"** ainda
- **Quebrar e consertar** é parte do processo
- **Seu feedback** é o único que importa agora
- **Simplicidade** > Complexidade desnecessária
- **Velocidade** > Perfeição prematura

Pronto para aplicar os fixes e ver a mágica acontecer? 🚀 