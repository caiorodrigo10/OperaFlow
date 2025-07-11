'use client';

import { useState } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { handleApiError } from '@/lib/error-handler';
import { CACHE_CONFIG } from '@/hooks/react-query/cache-config';

export function ReactQueryProvider({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: unknown;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Usar configuração otimizada como padrão
            staleTime: CACHE_CONFIG.STATIC.staleTime, // 5 minutos (padrão razoável)
            gcTime: CACHE_CONFIG.STATIC.gcTime, // 10 minutos para garbage collection
            
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
          },
          mutations: {
            retry: (failureCount, error: any) => {
              if (error?.status >= 400 && error?.status < 500) return false;
              return failureCount < 1;
            },
            onError: (error: any, variables: any, context: any) => {
              handleApiError(error, {
                operation: 'perform action',
                silent: false,
              });
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
        {/* {process.env.NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
