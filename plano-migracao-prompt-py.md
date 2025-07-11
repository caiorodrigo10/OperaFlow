# 🎯 Plano de Otimização: backend/agent/prompt.py

## 📊 Contexto Específico

### Arquivo Alvo
- **Arquivo**: `backend/agent/prompt.py` (655 linhas)
- **Branch**: `prompt-optimization-20250115`
- **Status**: Desenvolvimento (sem usuários em produção)
- **Problemas Identificados**:
  1. ❌ "Quadrado Branco" - ferramenta `ask` com texto vazio
  2. ❌ Relatórios incompletos - falha em arquivos grandes
  3. ❌ Erro "Invalid String Replacement" - formato não claro

---

## 🚀 Estratégia: Fix Direto no prompt.py

### Princípio
- Editar APENAS `backend/agent/prompt.py`
- Manter compatibilidade total
- Testar cada mudança isoladamente
- Não criar novos arquivos por enquanto

---

## 📋 Fase 0: Backup (2 minutos)

```bash
# Backup simples
cp backend/agent/prompt.py backend/agent/prompt_backup_20250119.py

# Commit estado atual
git add backend/agent/prompt_backup_20250119.py
git commit -m "backup: prompt.py before fixes"
```

---

## 🔧 Fase 1: Três Fixes Críticos (30 minutos)

### Fix 1: "Quadrado Branco" (linha ~580)

**Localizar**: Seção `## 7.2 COMMUNICATION PROTOCOLS`

**Adicionar após esta seção**:
```python
## 7.2.1 ASK TOOL VALIDATION (CRITICAL)
- **NEVER call 'ask' with empty text**: The tool will fail silently
- **Before using 'ask' tool, validate**:
  1. Text parameter has actual content (not empty/whitespace)
  2. Question is specific and actionable
  3. Context is included for clarity
- **Valid examples**:
  ✅ ask("I found 3 database options: PostgreSQL, MongoDB, SQLite. Which do you prefer?")
  ✅ ask("Should I proceed with fixing all 5 identified issues?")
- **Invalid examples**:
  ❌ ask("")
  ❌ ask("   ")
  ❌ ask("Continue?")
- **If nothing to ask, use narrative text instead**
```

### Fix 2: Relatórios Grandes (linha ~530)

**Localizar**: Seção `## 6.1 WRITING GUIDELINES`

**Adicionar após "avoid list formatting"**:
```python
## 6.1.1 LARGE CONTENT HANDLING
- **For content > 1000 lines or > 50KB**: Use incremental approach
  1. Create outline file first (e.g., report_outline.md)
  2. Build sections in separate operations
  3. Use str-replace to append sections
  4. Save progress after each major section
- **NEVER attempt to write entire large files in one create-file operation**
- **Example for 20+ item report**:
  ```
  Step 1: create-file report_outline.md (structure only)
  Step 2: create-file temp_section1.md (items 1-5)
  Step 3: str-replace to append section1 to main report
  Step 4: Continue incrementally...
  ```
```

### Fix 3: String Replace Clarification (linha ~240)

**Localizar**: Seção sobre ferramentas CLI (após `## 3.4 FILE MANAGEMENT`)

**Adicionar nova subseção**:
```python
## 3.4.1 STR-REPLACE TOOL SPECIFICS
- **EXACT MATCH REQUIRED**: The tool needs character-perfect matching
  - Include ALL whitespace and indentation
  - Include ALL line breaks exactly as they appear
  - No modifications to the original text
- **Size limit**: Maximum 20 lines per replacement for reliability
- **Common failures and solutions**:
  ❌ Missing indentation → Copy exact indentation
  ❌ Wrong line breaks → Use exact line endings from file
  ❌ Partial matches → Include more context lines
- **For large changes**: Use file rewrite instead of str-replace
```

---

## 🧪 Fase 2: Teste Imediato (30 minutos)

### Script de Teste
```bash
# test_fixes.sh
#!/bin/bash

echo "=== Testing Fix 1: Empty Ask ==="
# Trigger: "Document this pattern"
# Expected: No empty ask calls

echo "=== Testing Fix 2: Large Report ==="
# Trigger: "Create a report with 25 test results"
# Expected: Incremental file creation

echo "=== Testing Fix 3: String Replace ==="
# Trigger: "Update the function to add logging"
# Expected: Successful replacement
```

### Reiniciar Backend
```bash
cd backend
# Parar processo atual
pkill -f "python api.py"
# Iniciar com novo prompt
python api.py
```

---

## 🔍 Fase 3: Ajustes Baseados em Feedback (Próximos dias)

### Monitoramento Simples
```python
# No próprio prompt.py, adicionar comentário de tracking:
"""
FIX TRACKING (2025-01-19):
- [x] Empty ask validation added (line ~590)
- [x] Large content strategy added (line ~540)
- [x] Str-replace clarification added (line ~250)
- [ ] Monitor for new issues...
"""
```

### Critérios de Sucesso
1. ✅ Nenhum "quadrado branco" em 10 testes
2. ✅ Relatórios grandes criados com sucesso
3. ✅ Str-replace funcionando em >80% dos casos

---

## 🎯 Melhorias Futuras (Quando Necessário)

### Fase 4: Thinking Framework (Opcional)
Se os problemas persistirem, adicionar no início da seção 5:
```python
## 5.0 THINK BEFORE ACTING
Before using any tool:
<think>
1. What exactly is the user asking?
2. What tool is most appropriate?
3. Are all parameters valid and non-empty?
4. What could go wrong?
</think>
```

### Fase 5: Refatoração (Apenas se Crescer Muito)
- Só considerar modularização se prompt.py > 1000 linhas
- Por enquanto, manter tudo em um arquivo é mais simples

---

## ✅ Checklist de Implementação

### Hoje (1 hora total)
- [ ] Backup prompt.py
- [ ] Adicionar Fix 1 (validação ask)
- [ ] Adicionar Fix 2 (content strategy) 
- [ ] Adicionar Fix 3 (str-replace)
- [ ] Reiniciar backend
- [ ] Testar cada fix
- [ ] Commit se funcionando

### Amanhã
- [ ] Uso intensivo
- [ ] Documentar novos problemas
- [ ] Ajustar fixes se necessário

---

## 📝 Notas Importantes

1. **NÃO** criar novos arquivos ainda
2. **NÃO** modularizar prematuramente  
3. **NÃO** adicionar complexidade desnecessária
4. **FOCAR** apenas nos 3 problemas identificados
5. **TESTAR** após cada mudança

---

## 💡 Resumo da Estratégia

> "Três cirurgias precisas no prompt.py para resolver 90% dos problemas atuais. Simples, direto e efetivo."

### Tempo Total Estimado
- Backup: 2 min
- Edições: 20 min
- Testes: 30 min
- **Total: ~1 hora**

Pronto para aplicar os fixes? 🚀 