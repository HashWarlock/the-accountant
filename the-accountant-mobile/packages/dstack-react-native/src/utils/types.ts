/**
 * Dstack SDK Types for React Native
 */

export interface DstackConfig {
  apiEndpoint: string;
  appNamespace?: string;
  debug?: boolean;
}

export interface WalletInfo {
  userId: string;
  address: string;
  publicKey: string;
  email?: string;
}

export interface SignatureResult {
  signature: string;
  address: string;
  publicKey: string;
  message: string;
  timestamp: string;
  attestation?: AttestationInfo;
}

export interface AttestationInfo {
  quote: string;
  eventLog?: string;
  checksum?: string;
  verificationUrls?: {
    phala?: string;
    t16z?: string;
  };
}

export interface VerifyParams {
  message: string;
  signature: string;
  userId?: string;
}

export interface VerifyResult {
  valid: boolean;
  recoveredAddress: string;
  user: WalletInfo | null;
  message: string;
  signature: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  operation: 'signup' | 'sign' | 'verify';
  address?: string;
  publicKey?: string;
  message?: string;
  signature?: string;
  attestationChecksum?: string;
  phalaVerificationUrl?: string;
  t16zVerificationUrl?: string;
  verificationStatus: string;
  createdAt: string;
}

export interface AuditFilters {
  operation?: 'signup' | 'sign' | 'verify';
  limit?: number;
  offset?: number;
}

export interface AuditLogsResponse {
  logs: AuditEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SessionInfo {
  sessionToken: string;
  user: WalletInfo;
  expiresIn: string;
}

export type DstackError = {
  code: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'TEE_ERROR';
  message: string;
  details?: unknown;
};
