import React, { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getFileCacheConfig } from '../cache-config';

/**
 * Unified file cache system using React Query
 * Replaces the legacy FileCache with a more efficient approach
 */

// Utility functions
function normalizePath(path: string): string {
  if (!path) return '/workspace';
  
  // Ensure path starts with /workspace
  if (!path.startsWith('/workspace')) {
    path = `/workspace/${path.startsWith('/') ? path.substring(1) : path}`;
  }
  
  // Handle Unicode escape sequences
  try {
    path = path.replace(/\\u([0-9a-fA-F]{4})/g, (_, hexCode) => {
      return String.fromCharCode(parseInt(hexCode, 16));
    });
  } catch (e) {
    console.error('Error processing Unicode escapes in path:', e);
  }
  
  return path;
}

function detectContentType(filePath: string): 'text' | 'json' | 'blob' {
  if (!filePath) return 'text';
  
  const ext = filePath.toLowerCase().split('.').pop() || '';
  
  // Binary file extensions
  if (/^(xlsx|xls|docx|doc|pptx|ppt|pdf|png|jpg|jpeg|gif|bmp|webp|svg|ico|zip|exe|dll|bin|dat|obj|o|so|dylib|mp3|mp4|avi|mov|wmv|flv|wav|ogg)$/.test(ext)) {
    return 'blob';
  }
  
  // JSON files
  if (ext === 'json') return 'json';
  
  // Default to text
  return 'text';
}

function getMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop() || '';
  
  const mimeTypes: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    zip: 'application/zip',
    
    // Text
    txt: 'text/plain',
    json: 'application/json',
    js: 'text/javascript',
    ts: 'text/typescript',
    css: 'text/css',
    html: 'text/html',
    xml: 'application/xml',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Core fetch function that always returns a Blob
async function fetchFileAsBlob(
  sandboxId: string,
  filePath: string,
  token: string
): Promise<Blob> {
  const normalizedPath = normalizePath(filePath);
  
  const attemptFetch = async (isRetry: boolean = false): Promise<Response> => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sandboxes/${sandboxId}/files/content`);
    url.searchParams.append('path', normalizedPath);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      const errorMessage = `Failed to load file: ${response.status} ${response.statusText}`;
      
      // Check if this is a workspace initialization error and we haven't retried yet
      const isWorkspaceNotRunning = responseText.includes('Workspace is not running');
      if (isWorkspaceNotRunning && !isRetry) {
        console.log(`[UNIFIED CACHE] Workspace not ready, retrying in 2s for ${normalizedPath}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptFetch(true);
      }
      
      console.error(`[UNIFIED CACHE] Failed response for ${normalizedPath}: Status ${response.status}`);
      throw new Error(errorMessage);
    }
    
    return response;
  };
  
  const response = await attemptFetch();
  const blob = await response.blob();
  
  // Ensure correct MIME type
  const expectedMimeType = getMimeType(filePath);
  if (expectedMimeType !== blob.type && expectedMimeType !== 'application/octet-stream') {
    return new Blob([blob], { type: expectedMimeType });
  }
  
  return blob;
}

// Query key factory
export const unifiedFileKeys = {
  all: ['unified-files'] as const,
  file: (sandboxId: string, filePath: string) => 
    [...unifiedFileKeys.all, 'content', sandboxId, filePath] as const,
  directory: (sandboxId: string, dirPath: string) => 
    [...unifiedFileKeys.all, 'directory', sandboxId, dirPath] as const,
};

/**
 * Main unified hook for file content
 * Always fetches as blob and provides transformations
 */
export function useUnifiedFileContent(
  sandboxId?: string,
  filePath?: string,
  options: {
    contentType?: 'auto' | 'text' | 'blob' | 'json';
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  } = {}
) {
  const { session } = useAuth();
  const normalizedPath = filePath ? normalizePath(filePath) : null;
  const detectedContentType = filePath ? detectContentType(filePath) : 'text';
  const requestedContentType = options.contentType === 'auto' ? detectedContentType : (options.contentType || detectedContentType);
  
  // Always fetch as blob for maximum efficiency
  const blobQuery = useQuery({
    queryKey: sandboxId && normalizedPath ? 
      unifiedFileKeys.file(sandboxId, normalizedPath) : [],
    queryFn: async () => {
      if (!sandboxId || !normalizedPath) {
        throw new Error('Missing required parameters');
      }
      
      console.log(`[UNIFIED CACHE] Fetching ${normalizedPath} as blob`);
      return fetchFileAsBlob(sandboxId, normalizedPath, session?.access_token || '');
    },
    enabled: Boolean(sandboxId && normalizedPath && session?.access_token && (options.enabled !== false)),
    staleTime: options.staleTime || getFileCacheConfig(requestedContentType === 'blob' ? 'blob' : requestedContentType === 'json' ? 'json' : 'text').staleTime,
    gcTime: options.gcTime || getFileCacheConfig(requestedContentType === 'blob' ? 'blob' : requestedContentType === 'json' ? 'json' : 'text').gcTime,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
  
  // Client-side transformations (no additional requests)
  const transformedData = useMemo(async () => {
    if (!blobQuery.data) return null;
    
    const blob = blobQuery.data;
    
    switch (requestedContentType) {
      case 'text':
        return await blob.text();
      case 'json':
        const text = await blob.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          return null;
        }
      case 'blob':
      default:
        return blob;
    }
  }, [blobQuery.data, requestedContentType]);
  
  // Blob URL management with automatic cleanup
  const blobUrl = useMemo(() => {
    if (!blobQuery.data || requestedContentType !== 'blob') return null;
    
    const url = URL.createObjectURL(blobQuery.data);
    console.log(`[UNIFIED CACHE] Created blob URL for ${filePath}: ${url}`);
    
    // Cleanup will be handled by React when the component unmounts or dependencies change
    return url;
  }, [blobQuery.data, requestedContentType, filePath]);
  
  // Cleanup blob URL when component unmounts or data changes
  React.useEffect(() => {
    return () => {
      if (blobUrl) {
        console.log(`[UNIFIED CACHE] Cleaning up blob URL: ${blobUrl}`);
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);
  
  return {
    // Raw blob data (always available)
    blob: blobQuery.data,
    
    // Transformed data based on requested content type
    data: transformedData,
    
    // Blob URL for direct use (only when contentType is 'blob')
    blobUrl,
    
    // Query state
    isLoading: blobQuery.isLoading,
    error: blobQuery.error,
    isSuccess: blobQuery.isSuccess,
    
    // Utility methods
    refetch: blobQuery.refetch,
    
    // Legacy compatibility (for migration period)
    refreshCache: blobQuery.refetch,
    getCachedFile: () => Promise.resolve(transformedData),
    getFromCache: () => transformedData,
  };
}

/**
 * Hook for preloading multiple files efficiently
 */
export function useUnifiedFilePreloader() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  const preloadFiles = useCallback(async (
    sandboxId: string,
    filePaths: string[]
  ): Promise<void> => {
    if (!session?.access_token) {
      console.warn('[UNIFIED CACHE] Cannot preload files: No authentication token available');
      return;
    }
    
    // Automatic deduplication
    const uniquePaths = [...new Set(filePaths)];
    console.log(`[UNIFIED CACHE] Preloading ${uniquePaths.length} files for sandbox ${sandboxId}`);
    
    const preloadPromises = uniquePaths.map(async (path) => {
      const normalizedPath = normalizePath(path);
      
      // Check if already cached
      const queryKey = unifiedFileKeys.file(sandboxId, normalizedPath);
      const existingData = queryClient.getQueryData(queryKey);
      
      if (existingData) {
        console.log(`[UNIFIED CACHE] Already cached: ${normalizedPath}`);
        return existingData;
      }
      
      // Prefetch the file
      return queryClient.prefetchQuery({
        queryKey,
        queryFn: () => fetchFileAsBlob(sandboxId, normalizedPath, session.access_token!),
        staleTime: getFileCacheConfig('blob').staleTime, // Use blob config for preloading
      });
    });
    
    await Promise.all(preloadPromises);
    console.log(`[UNIFIED CACHE] Completed preloading ${uniquePaths.length} files`);
  }, [queryClient, session?.access_token]);
  
  return { preloadFiles };
}

/**
 * Utility hook for blob URL management
 */
export function useBlobUrl(blob: Blob | null | undefined) {
  const [url, setUrl] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
    
    // Cleanup function
    return () => {
      URL.revokeObjectURL(blobUrl);
      setUrl(null);
    };
  }, [blob]);
  
  return url;
} 