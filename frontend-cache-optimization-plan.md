# Plano de Otimização: Frontend e Cache

## **Problemas Identificados**

### 1. **Configuração Agressiva do React Query**
- **Stale time muito curto**: 20 segundos no provider principal
- **Refetch excessivo**: `refetchOnMount: true`, `refetchOnWindowFocus: true`, `refetchOnReconnect: 'always'`
- **Configurações inconsistentes**: Diferentes stale times em hooks específicos (30s, 2min, 5min, 10min)

### 2. **Vários Sistemas de Cache Sobrepostos**
- **React Query**: Sistema principal de cache
- **FileCache (use-cached-file.ts)**: Sistema legado com Map global
- **Cache do navegador**: Headers HTTP nativos
- **Blob URLs**: Criação/revogação manual não coordenada

### 3. **Requisições Duplicadas**
- **Mesmo arquivo buscado múltiplas vezes**: Diferentes content types para o mesmo arquivo
- **Falta de deduplicação**: Requests simultâneos para o mesmo recurso
- **Preload não coordenado**: FileCache.preload vs React Query prefetch

## **Estratégia de Solução**

### **Fase 1: Consolidação do Sistema de Cache (Crítico)**
- Migrar completamente para React Query como único sistema de cache
- Deprecar gradualmente o FileCache legado
- Implementar deduplicação inteligente de requests

### **Fase 2: Otimização das Configurações (Alto Impacto)**
- Ajustar stale times baseado no tipo de conteúdo
- Reduzir refetches desnecessários
- Padronizar configurações across hooks

### **Fase 3: Otimização de Arquivos (Médio Impacto)**
- Implementar cache inteligente por tipo de arquivo
- Coordenar criação/revogação de Blob URLs
- Otimizar preloading

---

## **IMPLEMENTAÇÃO DETALHADA**

## **Etapa 1: Atualizar Configuração Principal do React Query**

### **Arquivo**: `frontend/src/providers/react-query-provider.tsx`

**Problemas atuais:**
```typescript
staleTime: 20 * 1000, // 20 segundos - MUITO CURTO
refetchOnMount: true, // Sempre refetch - DESNECESSÁRIO
refetchOnWindowFocus: true, // Refetch no foco - EXCESSIVO
refetchOnReconnect: 'always', // Sempre reconectar - AGRESSIVO
```

**Nova configuração otimizada:**
```typescript
defaultOptions: {
  queries: {
    // Aumentar stale time baseado no tipo de conteúdo
    staleTime: 5 * 60 * 1000, // 5 minutos (padrão razoável)
    gcTime: 10 * 60 * 1000, // 10 minutos para garbage collection
    
    // Reduzir refetches desnecessários
    refetchOnMount: false, // Só refetch se stale
    refetchOnWindowFocus: false, // Evitar refetch no foco
    refetchOnReconnect: true, // Só quando reconectar (não 'always')
    
    // Retry inteligente
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      if (error?.status === 404) return false;
      return failureCount < 2; // Reduzir de 3 para 2 tentativas
    },
  }
}
```

**Configurações específicas por tipo de conteúdo:**
- **Arquivos estáticos**: 15 minutos
- **Dados dinâmicos**: 2 minutos  
- **Metadados**: 5 minutos
- **Health checks**: 30 segundos

---

## **Etapa 2: Criar Sistema Unificado de Cache para Arquivos**

### **Arquivo**: `frontend/src/hooks/react-query/files/use-unified-file-cache.ts` (NOVO)

**Objetivo**: Substituir completamente o FileCache legado

```typescript
// Configurações otimizadas por tipo de arquivo
const FILE_CACHE_CONFIG = {
  'text': { staleTime: 2 * 60 * 1000, gcTime: 5 * 60 * 1000 },
  'json': { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  'blob': { staleTime: 15 * 60 * 1000, gcTime: 30 * 60 * 1000 },
} as const;

// Hook unificado que substitui todas as implementações
export function useUnifiedFileContent(
  sandboxId?: string,
  filePath?: string,
  options: {
    contentType?: 'auto' | 'text' | 'blob' | 'json';
    enabled?: boolean;
  } = {}
) {
  // Auto-detecção inteligente de content type
  // Deduplicação automática via React Query
  // Blob URL management automático
  // Preload coordenado
}
```

**Features:**
- **Auto-detecção de content type**: Baseado na extensão do arquivo
- **Deduplicação automática**: React Query previne requests duplicados
- **Blob URL management**: Criação/revogação automática e coordenada
- **Cache inteligente**: Diferentes stale times por tipo

---

## **Etapa 3: Padronizar Configurações Across Hooks**

### **Problema**: Configurações inconsistentes
```typescript
// Atual - INCONSISTENTE
staleTime: 30 * 1000,     // use-health.ts
staleTime: 2 * 60 * 1000, // use-thread-queries.ts  
staleTime: 5 * 60 * 1000, // use-agents.ts
staleTime: 10 * 60 * 1000, // use-pipedream.ts
```

### **Solução**: Arquivo de configuração centralizado

### **Arquivo**: `frontend/src/hooks/react-query/cache-config.ts` (NOVO)

```typescript
export const CACHE_CONFIG = {
  // Dados que mudam frequentemente
  DYNAMIC: {
    staleTime: 30 * 1000,     // 30 segundos
    gcTime: 2 * 60 * 1000,    // 2 minutos
  },
  
  // Dados que mudam ocasionalmente  
  SEMI_STATIC: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,    // 5 minutos
  },
  
  // Dados que raramente mudam
  STATIC: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
  },
  
  // Dados que quase nunca mudam
  VERY_STATIC: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
  }
} as const;

// Mapeamento por tipo de dados
export const CACHE_MAPPING = {
  health: CACHE_CONFIG.DYNAMIC,
  threads: CACHE_CONFIG.SEMI_STATIC,
  agents: CACHE_CONFIG.STATIC,
  models: CACHE_CONFIG.VERY_STATIC,
  files_text: CACHE_CONFIG.SEMI_STATIC,
  files_blob: CACHE_CONFIG.VERY_STATIC,
} as const;
```

---

## **Etapa 4: Implementar Deduplicação Inteligente**

### **Problema**: Múltiplas requests para o mesmo arquivo com content types diferentes

### **Solução**: Query key unificada + transformação no cliente

```typescript
// ANTES - Chaves diferentes para o mesmo arquivo
['file-content', sandboxId, filePath, 'text']
['file-content', sandboxId, filePath, 'blob'] 
['file-content', sandboxId, filePath, 'json']

// DEPOIS - Chave única + transformação
['file-content', sandboxId, filePath] // Uma única request
```

**Implementação:**
```typescript
export function useFileContent(sandboxId: string, filePath: string) {
  const query = useQuery({
    queryKey: ['file-content', sandboxId, filePath],
    queryFn: () => fetchFileAsBlob(sandboxId, filePath), // Sempre blob
    ...CACHE_MAPPING.files_blob
  });
  
  // Transformações no cliente (sem requests adicionais)
  const asText = useMemo(() => {
    if (query.data instanceof Blob) {
      return query.data.text(); // Async transformation
    }
    return null;
  }, [query.data]);
  
  const asBlobUrl = useMemo(() => {
    if (query.data instanceof Blob) {
      const url = URL.createObjectURL(query.data);
      // Auto-cleanup quando component unmount
      return url;
    }
    return null;
  }, [query.data]);
  
  return { blob: query.data, text: asText, blobUrl: asBlobUrl };
}
```

---

## **Etapa 5: Migração Gradual do FileCache Legado**

### **Estratégia de Migração Segura**

**Fase 5.1**: Criar wrapper de compatibilidade
```typescript
// Arquivo: frontend/src/hooks/use-cached-file-legacy.ts
export function useCachedFile(...args) {
  // Deprecation warning
  console.warn('useCachedFile is deprecated. Use useUnifiedFileContent instead.');
  
  // Proxy para nova implementação
  return useUnifiedFileContent(...args);
}
```

**Fase 5.2**: Migrar componentes gradualmente
- Identificar todos os usos de `useCachedFile`
- Migrar um componente por vez
- Testar cada migração isoladamente

**Fase 5.3**: Remover sistema legado
- Remover `use-cached-file.ts`
- Remover `FileCache` global
- Cleanup de imports

---

## **Etapa 6: Otimizar Blob URL Management**

### **Problema**: Blob URLs criadas/revogadas manualmente causam vazamentos

### **Solução**: Hook dedicado com cleanup automático

```typescript
export function useBlobUrl(blob: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
    
    // Cleanup automático
    return () => {
      URL.revokeObjectURL(blobUrl);
      setUrl(null);
    };
  }, [blob]);
  
  return url;
}
```

---

## **Etapa 7: Implementar Preload Coordenado**

### **Problema**: FileCache.preload vs React Query prefetch não coordenados

### **Solução**: Sistema unificado de preload

```typescript
export function useFilePreloader() {
  const queryClient = useQueryClient();
  
  const preloadFiles = useCallback(async (
    sandboxId: string, 
    filePaths: string[]
  ) => {
    // Deduplicação automática
    const uniquePaths = [...new Set(filePaths)];
    
    // Prefetch usando React Query (coordenado)
    const promises = uniquePaths.map(path => 
      queryClient.prefetchQuery({
        queryKey: ['file-content', sandboxId, path],
        queryFn: () => fetchFileAsBlob(sandboxId, path),
        staleTime: CACHE_MAPPING.files_blob.staleTime,
      })
    );
    
    await Promise.all(promises);
  }, [queryClient]);
  
  return { preloadFiles };
}
```

---

## **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **Semana 1: Configuração Base**
- [ ] Etapa 1: Atualizar React Query provider
- [ ] Etapa 3: Criar arquivo de configuração centralizado
- [ ] Teste: Verificar que não quebrou funcionalidades existentes

### **Semana 2: Sistema Unificado**
- [ ] Etapa 2: Criar hook unificado de arquivos
- [ ] Etapa 4: Implementar deduplicação
- [ ] Teste: Comparar performance antes/depois

### **Semana 3: Migração**
- [ ] Etapa 5.1: Criar wrapper de compatibilidade
- [ ] Etapa 5.2: Migrar 3-5 componentes críticos
- [ ] Teste: Verificar que migrações funcionam

### **Semana 4: Otimizações Finais**
- [ ] Etapa 6: Otimizar Blob URL management
- [ ] Etapa 7: Implementar preload coordenado
- [ ] Etapa 5.3: Remover código legado
- [ ] Teste: Performance final e cleanup

---

## **MÉTRICAS DE SUCESSO**

### **Performance**
- [ ] **Redução de 60-80%** no número de requests duplicados
- [ ] **Melhoria de 40-60%** no tempo de carregamento de arquivos
- [ ] **Redução de 50%** no uso de memória por vazamentos de Blob URLs

### **Desenvolvedor**
- [ ] **Configuração única** e consistente de cache
- [ ] **API simplificada** para carregamento de arquivos
- [ ] **Zero breaking changes** durante migração

### **Usuário**
- [ ] **Carregamento mais rápido** de arquivos já visualizados
- [ ] **Menos "loading spinners"** em navegação
- [ ] **Interface mais responsiva** em geral

---

## **RISCOS E MITIGAÇÕES**

### **Risco**: Breaking changes durante migração
**Mitigação**: Wrapper de compatibilidade + migração gradual

### **Risco**: Cache muito agressivo causa dados stale
**Mitigação**: Configurações conservadoras + invalidação manual quando necessário

### **Risco**: Vazamentos de memória com Blob URLs
**Mitigação**: Cleanup automático + useEffect dependencies corretas

---

## **PRÓXIMOS PASSOS**

1. **Aprovação do plano**: Revisar e aprovar estratégia
2. **Setup de ambiente**: Branch dedicado para desenvolvimento
3. **Implementação iterativa**: Seguir cronograma semanal
4. **Testes contínuos**: Verificar performance a cada etapa
5. **Deploy gradual**: Feature flags para rollback se necessário

**Estimativa total**: 3-4 semanas de desenvolvimento + 1 semana de testes 