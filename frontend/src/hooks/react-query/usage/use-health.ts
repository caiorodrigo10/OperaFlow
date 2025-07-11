'use client';

import { createQueryHook } from '@/hooks/use-query';
import { checkApiHealth } from '@/lib/api';
import { healthKeys } from '../files/keys';
import { getCacheConfig } from '../cache-config';

export const useApiHealth = createQueryHook(
  healthKeys.api(),
  checkApiHealth,
  {
    ...getCacheConfig('health'),
    refetchInterval: 60 * 1000,
    retry: 3,
  }
); 