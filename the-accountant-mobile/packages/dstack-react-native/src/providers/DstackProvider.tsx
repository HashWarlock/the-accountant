import React, { createContext, useContext, ReactNode } from 'react';
import { DstackConfig } from '../utils/types';
import { DstackApiClient } from '../utils/api';

interface DstackContextValue {
  config: DstackConfig;
  apiClient: DstackApiClient;
}

const DstackContext = createContext<DstackContextValue | null>(null);

export interface DstackProviderProps {
  config: DstackConfig;
  children: ReactNode;
}

/**
 * Dstack Provider Component
 * Provides API client and configuration to child components
 */
export function DstackProvider({ config, children }: DstackProviderProps) {
  const apiClient = React.useMemo(() => new DstackApiClient(config), [config]);

  const value: DstackContextValue = {
    config,
    apiClient,
  };

  return <DstackContext.Provider value={value}>{children}</DstackContext.Provider>;
}

/**
 * Hook to access Dstack context
 */
export function useDstackContext() {
  const context = useContext(DstackContext);

  if (!context) {
    throw new Error('useDstackContext must be used within DstackProvider');
  }

  return context;
}
