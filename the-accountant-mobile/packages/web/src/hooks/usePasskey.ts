import { useMutation, useQuery } from '@tanstack/react-query'
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'

const API_BASE_URL = 'http://localhost:4000'

interface RegisterBeginResponse {
  challenge: string
  rp: { name: string; id: string }
  user: { id: string; name: string; displayName: string }
  pubKeyCredParams: Array<{ alg: number; type: string }>
  timeout?: number
  attestation?: string
  excludeCredentials?: Array<{ id: string; type: string }>
  authenticatorSelection?: {
    residentKey?: string
    userVerification?: string
    authenticatorAttachment?: string
  }
}

interface RegisterCompleteRequest {
  userId: string
  email: string
  credential: any
}

interface RegisterCompleteResponse {
  success: boolean
  walletAddress: string
  sessionToken: string
  credentialId: string
}

interface AuthBeginRequest {
  email: string
}

interface AuthBeginResponse {
  challenge: string
  timeout?: number
  rpId?: string
  allowCredentials?: Array<{ id: string; type: string }>
  userVerification?: string
}

interface AuthCompleteRequest {
  credential: any
}

interface AuthCompleteResponse {
  success: boolean
  userId: string
  email: string
  walletAddress: string
  sessionToken: string
}

export function usePasskey() {
  // Register passkey
  const registerPasskey = useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      // Step 1: Get registration options from server
      const beginResponse = await fetch(`${API_BASE_URL}/api/passkey/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })

      if (!beginResponse.ok) {
        const error = await beginResponse.json()
        throw new Error(error.error || 'Failed to initiate passkey registration')
      }

      const options = (await beginResponse.json()) as PublicKeyCredentialCreationOptionsJSON

      // Step 2: Create credential using WebAuthn
      let credential
      try {
        credential = await startRegistration(options)
      } catch (error) {
        console.error('WebAuthn registration error:', error)
        throw new Error('Failed to create passkey. Make sure your device supports passkeys.')
      }

      // Step 3: Send credential to server for verification
      const completeResponse = await fetch(`${API_BASE_URL}/api/passkey/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, credential }),
      })

      if (!completeResponse.ok) {
        const error = await completeResponse.json()
        throw new Error(error.error || 'Failed to complete passkey registration')
      }

      const result = (await completeResponse.json()) as RegisterCompleteResponse

      // Store session token
      localStorage.setItem('session_token', result.sessionToken)
      localStorage.setItem('user_id', userId)
      localStorage.setItem('email', email)
      localStorage.setItem('wallet_address', result.walletAddress)

      return result
    },
  })

  // Authenticate with passkey
  const authenticatePasskey = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Step 1: Get authentication options from server
      const beginResponse = await fetch(`${API_BASE_URL}/api/passkey/auth/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!beginResponse.ok) {
        const error = await beginResponse.json()
        throw new Error(error.error || 'Failed to initiate passkey authentication')
      }

      const options = (await beginResponse.json()) as PublicKeyCredentialRequestOptionsJSON

      // Step 2: Get credential using WebAuthn
      let credential
      try {
        credential = await startAuthentication(options)
      } catch (error) {
        console.error('WebAuthn authentication error:', error)
        throw new Error('Failed to authenticate with passkey. Please try again.')
      }

      // Step 3: Send credential to server for verification
      const completeResponse = await fetch(`${API_BASE_URL}/api/passkey/auth/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })

      if (!completeResponse.ok) {
        const error = await completeResponse.json()
        throw new Error(error.error || 'Failed to complete passkey authentication')
      }

      const result = (await completeResponse.json()) as AuthCompleteResponse

      // Store session token
      localStorage.setItem('session_token', result.sessionToken)
      localStorage.setItem('user_id', result.userId)
      localStorage.setItem('email', result.email)
      localStorage.setItem('wallet_address', result.walletAddress)

      return result
    },
  })

  // Check if passkeys are supported
  const isPasskeySupported = () => {
    return (
      window?.PublicKeyCredential !== undefined &&
      navigator?.credentials !== undefined
    )
  }

  // Check if platform authenticator is available
  const checkPlatformAuthenticator = useQuery({
    queryKey: ['platformAuthenticator'],
    queryFn: async () => {
      if (!isPasskeySupported()) return false
      try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      } catch {
        return false
      }
    },
    staleTime: Infinity,
  })

  return {
    registerPasskey: registerPasskey.mutateAsync,
    authenticatePasskey: authenticatePasskey.mutateAsync,
    isRegistering: registerPasskey.isPending,
    isAuthenticating: authenticatePasskey.isPending,
    registerError: registerPasskey.error,
    authError: authenticatePasskey.error,
    registerData: registerPasskey.data,
    authData: authenticatePasskey.data,
    isPasskeySupported: isPasskeySupported(),
    isPlatformAuthenticatorAvailable: checkPlatformAuthenticator.data ?? false,
    reset: () => {
      registerPasskey.reset()
      authenticatePasskey.reset()
    },
  }
}
