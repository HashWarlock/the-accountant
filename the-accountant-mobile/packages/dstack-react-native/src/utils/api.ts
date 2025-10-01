import { storage } from './storage';
import {
  DstackConfig,
  WalletInfo,
  SignatureResult,
  VerifyParams,
  VerifyResult,
  AuditFilters,
  AuditLogsResponse,
  SessionInfo,
  DstackError,
} from './types';

/**
 * API Client for Dstack Backend
 */
export class DstackApiClient {
  private config: DstackConfig;

  constructor(config: DstackConfig) {
    this.config = config;
  }

  private log(...args: any[]) {
    if (this.config.debug) {
      console.log('[Dstack API]', ...args);
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storage.getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw {
        code: 'NETWORK_ERROR',
        message: error.error || `HTTP ${response.status}`,
        details: error,
      } as DstackError;
    }

    return response.json();
  }

  /**
   * Create new wallet and user
   */
  async signup(email: string, userId: string): Promise<SessionInfo> {
    this.log('Creating wallet for user:', userId);

    const response = await fetch(`${this.config.apiEndpoint}/api/wallet/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId }),
    });

    const data = await this.handleResponse<SessionInfo>(response);

    // Save session and user info
    await storage.saveSession(data.sessionToken);
    await storage.saveUser(data.user);

    return data;
  }

  /**
   * Create session for existing user
   */
  async createSession(userId: string): Promise<SessionInfo> {
    this.log('Creating session for user:', userId);

    const response = await fetch(`${this.config.apiEndpoint}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await this.handleResponse<SessionInfo>(response);

    // Save session and user info
    await storage.saveSession(data.sessionToken);
    await storage.saveUser(data.user);

    return data;
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<{ sessionToken: string; expiresIn: string }> {
    const token = await storage.getSession();
    if (!token) {
      throw { code: 'AUTH_ERROR', message: 'No session token found' } as DstackError;
    }

    this.log('Refreshing session token');

    const response = await fetch(`${this.config.apiEndpoint}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await this.handleResponse<{ sessionToken: string; expiresIn: string }>(response);

    // Update stored token
    await storage.saveSession(data.sessionToken);

    return data;
  }

  /**
   * Sign message with user's wallet
   */
  async signMessage(message: string): Promise<SignatureResult> {
    this.log('Signing message');

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.config.apiEndpoint}/api/wallet/sign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    return this.handleResponse<SignatureResult>(response);
  }

  /**
   * Verify signature
   */
  async verifySignature(params: VerifyParams): Promise<VerifyResult> {
    this.log('Verifying signature');

    const response = await fetch(`${this.config.apiEndpoint}/api/wallet/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    return this.handleResponse<VerifyResult>(response);
  }

  /**
   * Get user's wallet keys
   */
  async getWalletKeys(): Promise<WalletInfo> {
    this.log('Getting wallet keys');

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.config.apiEndpoint}/api/wallet/keys`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<WalletInfo>(response);
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogsResponse> {
    this.log('Getting audit logs with filters:', filters);

    const params = new URLSearchParams();
    if (filters.operation) params.append('operation', filters.operation);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.config.apiEndpoint}/api/audit/logs?${params.toString()}`,
      { headers }
    );

    return this.handleResponse<AuditLogsResponse>(response);
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    this.log('Exporting audit logs as', format);

    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.config.apiEndpoint}/api/audit/export?format=${format}`,
      { headers }
    );

    if (!response.ok) {
      throw { code: 'NETWORK_ERROR', message: 'Export failed' } as DstackError;
    }

    return response.blob();
  }

  /**
   * Sign out (clear local session)
   */
  async signOut(): Promise<void> {
    this.log('Signing out');
    await storage.clear();
  }
}
