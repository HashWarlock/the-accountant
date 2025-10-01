import { useMutation } from '@tanstack/react-query';
import { useDstackContext } from '../providers/DstackProvider';
import { SignatureResult, VerifyParams, VerifyResult } from '../utils/types';

/**
 * Hook for message signing and verification
 */
export function useDstackSign() {
  const { apiClient } = useDstackContext();

  // Mutation to sign message
  const signMutation = useMutation<SignatureResult, Error, string>({
    mutationFn: (message: string) => apiClient.signMessage(message),
  });

  // Mutation to verify signature
  const verifyMutation = useMutation<VerifyResult, Error, VerifyParams>({
    mutationFn: (params: VerifyParams) => apiClient.verifySignature(params),
  });

  return {
    // Sign
    sign: signMutation.mutateAsync,
    isSigning: signMutation.isPending,
    signResult: signMutation.data ?? null,
    signError: signMutation.error,

    // Verify
    verify: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verifyResult: verifyMutation.data ?? null,
    verifyError: verifyMutation.error,

    // Reset states
    resetSign: signMutation.reset,
    resetVerify: verifyMutation.reset,
  };
}
