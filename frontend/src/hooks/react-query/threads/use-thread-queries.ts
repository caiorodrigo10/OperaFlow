'use client';

import { createQueryHook } from '@/hooks/use-query';
import { getThreads } from '@/lib/api';
import { threadKeys } from './keys';
import { getCacheConfig } from '../cache-config';

export const useThreadsByProject = (projectId?: string) =>
  createQueryHook(
    threadKeys.byProject(projectId || ''),
    () => projectId ? getThreads(projectId) : Promise.resolve([]),
    {
      enabled: !!projectId,
      ...getCacheConfig('threads'),
    }
  )();

export const useAllThreads = createQueryHook(
  threadKeys.all,
  () => getThreads(),
  getCacheConfig('threads')
); 