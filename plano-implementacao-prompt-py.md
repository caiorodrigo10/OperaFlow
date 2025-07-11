# 🎯 Plano de Implementação: Otimização do prompt.py

## 📊 Contexto

- **Arquivo**: `backend/agent/prompt.py` (656 linhas)
- **Branch Atual**: `prompt-optimization-20250115`
- **Status**: Desenvolvimento (sem usuários em produção)
- **Objetivo**: Aplicar técnicas de engenharia de prompt mantendo TODAS as funcionalidades

---

## ✅ Estratégia: Implementação Incremental Segura

### Princípios
1. **Preservar 100% do conteúdo atual** - não perder nenhuma instrução
2. **Adicionar melhorias incrementalmente** - uma técnica por vez
3. **Testar após cada mudança** - validar que nada quebrou
4. **Backup antes de começar** - segurança total

---

## 📋 Fase 0: Preparação (5 minutos)

### 1. Criar Backup com Timestamp
```bash
cp backend/agent/prompt.py backend/agent/prompt_backup_$(date +%Y%m%d_%H%M%S).py
```

### 2. Commit do Estado Atual
```bash
git add backend/agent/prompt.py
git commit -m "feat: backup prompt.py before optimization"
```

### 3. Criar Arquivo de Teste
```bash
# Criar um script simples para testar o agente após cada mudança
echo "Teste básico: criar um arquivo e listar conteúdo" > test_prompt.txt
```

---

## 🚀 Fase 1: Correções Críticas (30 minutos)

### Fix 1: Ferramenta `ask` - Prevenir Quadrado Branco

**Localização**: Linha ~600 (seção de comunicação)

**Adicionar após "## 7.2 COMMUNICATION PROTOCOLS":**
```python
- **CRITICAL ASK TOOL VALIDATION:**
  * The 'ask' tool MUST ALWAYS have meaningful text content
  * NEVER call ask with empty or whitespace-only text
  * Examples:
    ✅ CORRECT: <ask>I've documented the pattern. Would you like me to create additional examples?</ask>
    ❌ WRONG: <ask></ask> or <ask>   </ask>
  * If you have nothing to ask, use narrative text instead of the ask tool
```

### Fix 2: String Replace - Clarificar Formato

**Localização**: Linha ~240 (ferramentas)

**Adicionar na seção de CLI tools:**
```python
- STRING REPLACEMENT OPERATIONS:
  * For str-replace tool: ALWAYS include enough context for unique matching
  * The old_string MUST be unique within the file
  * Include at least 3-5 lines before and after the target text
  * Example format:
    old_string: |
      line before target
      line before target
      TARGET LINE TO REPLACE
      line after target
      line after target
    new_string: |
      line before target
      line before target
      NEW REPLACEMENT LINE
      line after target
      line after target
```

### Fix 3: Arquivos Grandes - Estratégia Incremental

**Localização**: Linha ~530 (content creation)

**Adicionar em "## 6.1 WRITING GUIDELINES":**
```python
- LARGE FILE HANDLING:
  * For files > 1000 lines or complex reports:
    1. Create outline first (outline.md)
    2. Write each section in separate files
    3. Use str-replace to build final document incrementally
    4. Never attempt to create entire large documents in one create-file call
  * Example workflow for 20+ item report:
    - create-file: report_outline.md
    - create-file: section1_data.md
    - str-replace: merge section1 into main report
    - Repeat for each section
```

---

## 🎨 Fase 2: Melhorias Estruturais (45 minutos)

### Melhoria 1: Adicionar Thinking Structure

**Localização**: Início do prompt, após identity

**Adicionar após "# 1. CORE IDENTITY & CAPABILITIES":**
```python
# 1.5 THINKING PROCESS
Before executing any task, follow this structured thinking:
1. **Understand**: What exactly is the user asking for?
2. **Plan**: What tools and steps will I need?
3. **Validate**: Are there any constraints or edge cases?
4. **Execute**: Proceed with the plan step by step
5. **Verify**: Check that the output meets the request

Always show your thinking when starting complex tasks.
```

### Melhoria 2: Tool Usage Examples

**Localização**: Após cada ferramenta principal

**Template para adicionar:**
```python
### [TOOL_NAME] - Usage Examples
✅ CORRECT USAGE:
   - Scenario: [when to use]
   - Example: [code example]
   - Result: [expected outcome]

❌ INCORRECT USAGE:
   - Scenario: [common mistake]
   - Wrong: [bad example]
   - Why: [explanation]
```

### Melhoria 3: Error Recovery Patterns

**Localização**: Nova seção após ferramentas

**Adicionar seção:**
```python
# 3.5 ERROR RECOVERY PATTERNS
Common errors and how to handle them:

## File Not Found
- First: Verify the path with ls
- Then: Check if in correct directory
- Finally: Create if needed or ask user

## Command Timeout
- Use blocking=false for long operations
- Check process with appropriate session
- Never wait more than 60 seconds for blocking commands

## Tool Failure
- Read error message carefully
- Try alternative approach
- Document what failed and why
- Ask user only if no alternatives exist
```

---

## 🔧 Fase 3: Otimizações Avançadas (Opcional - 1 hora)

### Opcional 1: XML Tags Básicas

**Converter seções principais para XML:**
```python
<identity>
You are Suna.so, an autonomous AI Agent created by the Kortix team.
</identity>

<capabilities>
[conteúdo da seção capabilities]
</capabilities>

<tools>
[conteúdo da seção tools]
</tools>
```

### Opcional 2: Modularização

**Criar referências internas:**
```python
# QUICK REFERENCE
- File Operations: See section 2.3.1
- Web Research: See section 4.4
- Error Handling: See section 3.5
- Communication: See section 7
```

---

## 📊 Validação e Testes

### Após CADA mudança:
1. **Salvar o arquivo**
2. **Testar com comando simples**:
   ```bash
   # Teste 1: Criar arquivo
   "Create a file test.txt with 'Hello World'"
   
   # Teste 2: String replace
   "Replace 'Hello' with 'Hi' in test.txt"
   
   # Teste 3: Ask tool
   "Ask me what my favorite color is"
   ```

3. **Verificar que não há regressões**

### Checklist de Validação:
- [ ] Agente responde normalmente
- [ ] Ferramentas funcionam corretamente
- [ ] Sem erros de parsing
- [ ] Comportamento consistente

---

## ⏱️ Cronograma Sugerido

### Hoje (1-2 horas)
1. **Backup** (5 min)
2. **Fase 1 - Fixes Críticos** (30 min)
3. **Teste completo** (15 min)
4. **Fase 2 - Melhorias Estruturais** (45 min)
5. **Validação final** (15 min)

### Amanhã (Opcional)
- Fase 3 - Otimizações Avançadas
- Testes mais complexos
- Ajustes finos

---

## 🚨 Sinais de Alerta

### Parar imediatamente se:
1. Agente para de responder
2. Ferramentas param de funcionar
3. Erros de sintaxe aparecem
4. Comportamento muito diferente do esperado

### Ação de recuperação:
```bash
# Restaurar backup imediatamente
cp backend/agent/prompt_backup_[TIMESTAMP].py backend/agent/prompt.py
```

---

## 📈 Métricas de Sucesso

### Problemas Resolvidos:
- ✅ Sem mais "quadrado branco"
- ✅ String replace funciona consistentemente
- ✅ Relatórios grandes são criados com sucesso
- ✅ Mensagens de erro mais claras

### Melhorias Observadas:
- Respostas mais estruturadas
- Menos tentativas de erro
- Melhor comunicação com usuário
- Execução mais previsível

---

## 🎯 Próximos Passos

Após implementação bem-sucedida:
1. Documentar mudanças realizadas
2. Criar testes automatizados
3. Considerar aplicar ao `gemini_prompt.py`
4. Planejar melhorias de longo prazo

---

*Plano criado para implementação segura e incremental, preservando todas as funcionalidades existentes* 