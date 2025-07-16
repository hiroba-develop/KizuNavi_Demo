import { apiClient } from './api';
import type { 
  User, 
  LoginRequest, 
  PasswordResetRequest, 
  PasswordResetData 
} from '../types';

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: User;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store token in API client
      apiClient.setToken(response.data.token);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    }
    
    throw new Error(response.message || 'ログインに失敗しました');
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage and token regardless of API call result
      apiClient.removeToken();
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  }

  static async validateToken(): Promise<TokenValidationResponse> {
    try {
      const response = await apiClient.get<TokenValidationResponse>('/auth/validate');
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  }

  static async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const response = await apiClient.post('/auth/reset-password-request', data);
    
    if (!response.success) {
      throw new Error(response.message || 'パスワードリセット要求に失敗しました');
    }
  }

  static async resetPassword(data: PasswordResetData): Promise<void> {
    const response = await apiClient.post('/auth/reset-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'パスワードリセットに失敗しました');
    }
  }

  static async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data.token;
    }
    
    throw new Error('トークンの更新に失敗しました');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error('ユーザー情報の取得に失敗しました');
  }
}

export default AuthService; 