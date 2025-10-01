import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type {
  SignupRequest,
  SignMessageRequest,
  VerifySignatureRequest,
} from '@/lib/api'

export function useWallet() {
  const queryClient = useQueryClient()

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => apiClient.signup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })

  const signMessageMutation = useMutation({
    mutationFn: (message: string) => apiClient.signMessage(message),
  })

  const verifySignatureMutation = useMutation({
    mutationFn: (data: VerifySignatureRequest) =>
      apiClient.verifySignature(data),
  })

  const disconnect = () => {
    apiClient.clearSessionToken()
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
  }

  return {
    signup: signupMutation.mutateAsync,
    signMessage: signMessageMutation.mutateAsync,
    verifySignature: verifySignatureMutation.mutateAsync,
    disconnect,
    isSigningUp: signupMutation.isPending,
    isSigning: signMessageMutation.isPending,
    isVerifying: verifySignatureMutation.isPending,
    signupData: signupMutation.data,
    signData: signMessageMutation.data,
    verifyData: verifySignatureMutation.data,
    signupError: signupMutation.error,
    signError: signMessageMutation.error,
    verifyError: verifySignatureMutation.error,
  }
}
