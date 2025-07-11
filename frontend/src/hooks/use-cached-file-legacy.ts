import { useUnifiedFileContent } from './react-query/files/use-unified-file-cache';

/**
 * Legacy compatibility wrapper for useCachedFile
 * @deprecated Use useUnifiedFileContent instead
 * 
 * This wrapper provides backward compatibility during the migration period.
 * It proxies calls to the new unified system while maintaining the old API.
 */
export function useCachedFile<T = string>(
  sandboxId?: string,
  filePath?: string,
  options: {
    expiration?: number;
    contentType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'base64';
    processFn?: (data: any) => T;
  } = {}
) {
  // Deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[DEPRECATED] useCachedFile is deprecated and will be removed in a future version. ` +
      `Please migrate to useUnifiedFileContent for better performance and consistency. ` +
      `File: ${filePath}, Sandbox: ${sandboxId}`
    );
  }

  // Map legacy contentType values to new ones
  const mappedContentType = (() => {
    switch (options.contentType) {
      case 'json': return 'json';
      case 'blob':
      case 'arrayBuffer':
      case 'base64': return 'blob';
      case 'text':
      default: return 'text';
    }
  })();

  // Use the new unified system
  const result = useUnifiedFileContent(sandboxId, filePath, {
    contentType: mappedContentType,
    staleTime: options.expiration,
  });

  // Process data if processFn is provided (legacy compatibility)
  const processedData = (() => {
    if (!result.data || !options.processFn) {
      return result.data as T;
    }
    
    try {
      return options.processFn(result.data);
    } catch (error) {
      console.error('[LEGACY WRAPPER] Error processing file data:', error);
      return null;
    }
  })();

  // Return legacy-compatible interface
  return {
    data: processedData,
    isLoading: result.isLoading,
    error: result.error,
    
    // Legacy methods (proxied to new system)
    refreshCache: result.refreshCache,
    getCachedFile: () => Promise.resolve(processedData),
    getFromCache: () => processedData,
    cache: new Map(), // Legacy compatibility - empty map
  };
}

// Export the legacy FileCache object for compatibility
export const FileCache = {
  get: (key: string) => {
    console.warn('[DEPRECATED] FileCache.get() is deprecated. Use React Query cache instead.');
    return null;
  },
  
  set: (key: string, content: any) => {
    console.warn('[DEPRECATED] FileCache.set() is deprecated. Use React Query cache instead.');
  },
  
  has: (key: string) => {
    console.warn('[DEPRECATED] FileCache.has() is deprecated. Use React Query cache instead.');
    return false;
  },
  
  clear: () => {
    console.warn('[DEPRECATED] FileCache.clear() is deprecated. Use React Query cache instead.');
  },
  
  delete: (key: string) => {
    console.warn('[DEPRECATED] FileCache.delete() is deprecated. Use React Query cache instead.');
    return false;
  },
  
  // Helper functions for backward compatibility
  getContentTypeFromPath: (path: string): 'text' | 'blob' | 'json' => {
    console.warn('[DEPRECATED] FileCache.getContentTypeFromPath() is deprecated.');
    if (!path) return 'text';
    
    const ext = path.toLowerCase().split('.').pop() || '';
    
    // Binary file extensions
    if (/^(xlsx|xls|docx|doc|pptx|ppt|pdf|png|jpg|jpeg|gif|bmp|webp|svg|ico|zip|exe|dll|bin|dat|obj|o|so|dylib|mp3|mp4|avi|mov|wmv|flv|wav|ogg)$/.test(ext)) {
      return 'blob';
    }
    
    // JSON files
    if (ext === 'json') return 'json';
    
    // Default to text
    return 'text';
  },
  
  isImageFile: (path: string): boolean => {
    console.warn('[DEPRECATED] FileCache.isImageFile() is deprecated.');
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
  },
  
  isPdfFile: (path: string): boolean => {
    console.warn('[DEPRECATED] FileCache.isPdfFile() is deprecated.');
    return path.toLowerCase().endsWith('.pdf');
  },
  
  isBlob: (value: any): boolean => {
    console.warn('[DEPRECATED] FileCache.isBlob() is deprecated.');
    return value instanceof Blob;
  },
  
  getContentType: (path: string, contentType?: 'text' | 'blob' | 'json'): 'text' | 'blob' | 'json' => {
    console.warn('[DEPRECATED] FileCache.getContentType() is deprecated.');
    return contentType || FileCache.getContentTypeFromPath(path);
  },
  
  preload: async (sandboxId: string, filePaths: string[], token?: string | null) => {
    console.warn('[DEPRECATED] FileCache.preload() is deprecated. Use useUnifiedFilePreloader instead.');
    return [];
  },
}; 