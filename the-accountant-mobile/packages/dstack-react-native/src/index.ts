/**
 * @dstack/react-native
 * React Native SDK for dstack TEE-backed key management
 */

// Providers
export { DstackProvider, useDstackContext } from './providers/DstackProvider';

// Hooks
export { useDstackWallet } from './hooks/useDstackWallet';
export { useDstackSign } from './hooks/useDstackSign';
export { useAuditLog } from './hooks/useAuditLog';

// Types
export type {
  DstackConfig,
  WalletInfo,
  SignatureResult,
  AttestationInfo,
  VerifyParams,
  VerifyResult,
  AuditEntry,
  AuditFilters,
  AuditLogsResponse,
  SessionInfo,
  DstackError,
} from './utils/types';

// Utils
export { storage } from './utils/storage';
export { DstackApiClient } from './utils/api';
