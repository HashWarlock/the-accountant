import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'dstack_session_token';
const USER_KEY = 'dstack_user_info';

/**
 * Secure storage adapter for React Native using Expo SecureStore
 */
export const storage = {
  /**
   * Save session token securely
   */
  async saveSession(token: string): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  },

  /**
   * Get session token
   */
  async getSession(): Promise<string | null> {
    return await SecureStore.getItemAsync(SESSION_KEY);
  },

  /**
   * Delete session token
   */
  async deleteSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },

  /**
   * Save user info
   */
  async saveUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  /**
   * Get user info
   */
  async getUser(): Promise<any | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Delete user info
   */
  async deleteUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await this.deleteSession();
    await this.deleteUser();
  },
};
