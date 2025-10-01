import { useQuery, useMutation } from '@tanstack/react-query';
import { useDstackContext } from '../providers/DstackProvider';
import { AuditFilters } from '../utils/types';

/**
 * Hook for audit log operations
 */
export function useAuditLog(filters: AuditFilters = {}) {
  const { apiClient } = useDstackContext();

  // Query to fetch audit logs
  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => apiClient.getAuditLogs(filters),
    enabled: true,
  });

  // Mutation to export logs
  const exportMutation = useMutation({
    mutationFn: (format: 'json' | 'csv' = 'json') => apiClient.exportAuditLogs(format),
  });

  return {
    // Data
    logs: logsData?.logs ?? [],
    pagination: logsData?.pagination ?? null,

    // Actions
    refetch,
    exportLogs: exportMutation.mutateAsync,

    // Status
    isLoading,
    isExporting: exportMutation.isPending,
    error: error || exportMutation.error,
  };
}
