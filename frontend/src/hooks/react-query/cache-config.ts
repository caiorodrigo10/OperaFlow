/**
 * Centralized cache configuration for React Query
 * Provides consistent cache settings across all hooks
 */

export const CACHE_CONFIG = {
  // Dados que mudam frequentemente (health checks, status)
  DYNAMIC: {
    staleTime: 30 * 1000,     // 30 segundos
    gcTime: 2 * 60 * 1000,    // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  
  // Dados que mudam ocasionalmente (threads, messages)
  SEMI_STATIC: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,    // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Dados que raramente mudam (agents, projects)
  STATIC: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Dados que quase nunca mudam (models, configurations)
  VERY_STATIC: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
} as const;

// Mapeamento por tipo de dados para facilitar o uso
export const CACHE_MAPPING = {
  // Health e status
  health: CACHE_CONFIG.DYNAMIC,
  billing: CACHE_CONFIG.DYNAMIC,
  
  // Dados de thread e conversas
  threads: CACHE_CONFIG.SEMI_STATIC,
  messages: CACHE_CONFIG.SEMI_STATIC,
  
  // Configurações de agentes e projetos
  agents: CACHE_CONFIG.STATIC,
  projects: CACHE_CONFIG.STATIC,
  subscriptions: CACHE_CONFIG.STATIC,
  
  // Dados que raramente mudam
  models: CACHE_CONFIG.VERY_STATIC,
  pipedream_apps: CACHE_CONFIG.VERY_STATIC,
  mcp_servers: CACHE_CONFIG.VERY_STATIC,
  
  // Arquivos por tipo
  files_text: CACHE_CONFIG.SEMI_STATIC,
  files_json: CACHE_CONFIG.STATIC,
  files_blob: CACHE_CONFIG.VERY_STATIC,
  directories: {
    staleTime: 30 * 1000,     // 30 segundos - diretórios podem mudar
    gcTime: 5 * 60 * 1000,    // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
} as const;

// Configurações específicas para diferentes tipos de arquivos
export const FILE_CACHE_CONFIG = {
  text: {
    staleTime: 2 * 60 * 1000,  // 2 minutos
    gcTime: 5 * 60 * 1000,     // 5 minutos
  },
  json: {
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 10 * 60 * 1000,    // 10 minutos
  },
  blob: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
  },
} as const;

// Helper function para obter configuração baseada no tipo
export function getCacheConfig(type: keyof typeof CACHE_MAPPING) {
  return CACHE_MAPPING[type] || CACHE_CONFIG.STATIC;
}

// Helper function para obter configuração de arquivos baseada no content type
export function getFileCacheConfig(contentType: 'text' | 'json' | 'blob') {
  return FILE_CACHE_CONFIG[contentType];
} 