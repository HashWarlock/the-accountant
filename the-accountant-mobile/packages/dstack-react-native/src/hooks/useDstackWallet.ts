import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDstackContext } from '../providers/DstackProvider';
import { storage } from '../utils/storage';
import { WalletInfo } from '../utils/types';

/**
 * Hook for wallet operations
 */
export function useDstackWallet() {
  const { apiClient } = useDstackContext();
  const queryClient = useQueryClient();

  // Query to get current wallet info from storage
  const { data: walletInfo, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['dstack-wallet'],
    queryFn: async () => {
      const user = await storage.getUser();
      return user as WalletInfo | null;
    },
  });

  // Query to check if user is connected
  const { data: sessionToken, isLoading: isLoadingSession } = useQuery({
    queryKey: ['dstack-session'],
    queryFn: () => storage.getSession(),
  });

  // Mutation to create wallet (signup)
  const signupMutation = useMutation({
    mutationFn: ({ email, userId }: { email: string; userId: string }) =>
      apiClient.signup(email, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(['dstack-wallet'], data.user);
      queryClient.setQueryData(['dstack-session'], data.sessionToken);
    },
  });

  // Mutation to connect (create session for existing user)
  const connectMutation = useMutation({
    mutationFn: (userId: string) => apiClient.createSession(userId),
    onSuccess: (data) => {
      queryClient.setQueryData(['dstack-wallet'], data.user);
      queryClient.setQueryData(['dstack-session'], data.sessionToken);
    },
  });

  // Mutation to disconnect
  const disconnectMutation = useMutation({
    mutationFn: () => apiClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(['dstack-wallet'], null);
      queryClient.setQueryData(['dstack-session'], null);
      queryClient.invalidateQueries({ queryKey: ['dstack-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dstack-session'] });
    },
  });

  return {
    // Wallet state
    address: walletInfo?.address ?? null,
    publicKey: walletInfo?.publicKey ?? null,
    userId: walletInfo?.userId ?? null,
    email: walletInfo?.email ?? null,
    isConnected: !!sessionToken && !!walletInfo,

    // Actions
    signup: signupMutation.mutateAsync,
    connect: connectMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,

    // Status
    isLoading: isLoadingWallet || isLoadingSession,
    isSigningUp: signupMutation.isPending,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    error:
      signupMutation.error || connectMutation.error || disconnectMutation.error || null,
  };
}
