// Use relative URLs so Vite proxy handles routing
const API_BASE_URL = ''

export interface SignupRequest {
  email: string
  userId: string
}

export interface SignupResponse {
  user: {
    userId: string
    email: string
    address: string
    pubKeyHex: string
  }
  sessionToken: string
  attestation: {
    quote: string
    eventLog: string
    checksum: string
    verificationUrls: {
      phala: string
      t16z: string
    }
  }
}

export interface SignMessageRequest {
  message: string
}

export interface SignMessageResponse {
  signature: string
  address: string
  publicKey: string
  message: string
  timestamp: string
  attestation: {
    quote: string
    eventLog: string
    checksum: string
    verificationUrls: {
      phala: string
      t16z: string
    }
  }
}

export interface VerifySignatureRequest {
  message: string
  signature: string
  userId: string
}

export interface VerifySignatureResponse {
  valid: boolean
  recoveredAddress: string
  user: {
    userId: string
    email: string
    address: string
  }
  message: string
  signature: string
}

class ApiClient {
  private getSessionToken(): string | null {
    return localStorage.getItem('session_token')
  }

  private setSessionToken(token: string): void {
    localStorage.setItem('session_token', token)
  }

  clearSessionToken(): void {
    localStorage.removeItem('session_token')
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await fetch(`${API_BASE_URL}/api/wallet/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const result = await response.json()
    this.setSessionToken(result.sessionToken)
    return result
  }

  async signMessage(message: string): Promise<SignMessageResponse> {
    const token = this.getSessionToken()
    if (!token) {
      throw new Error('No session token. Please sign up first.')
    }

    const response = await fetch(`${API_BASE_URL}/api/wallet/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign message failed')
    }

    return response.json()
  }

  async verifySignature(
    data: VerifySignatureRequest
  ): Promise<VerifySignatureResponse> {
    const response = await fetch(`${API_BASE_URL}/api/wallet/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Verification failed')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
