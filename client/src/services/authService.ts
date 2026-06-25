import { api } from '../utils/api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  };
}

class AuthService {
  async register(data: RegisterData) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginData) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(data: VerifyEmailData) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/verify-email', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resendOtp(data: ResendOtpData) {
    try {
      const response = await api.post('/api/auth/resend-otp', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async googleLogin(idToken: string) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/google', { idToken });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getMe() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await api.post('/api/auth/logout', {});
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logoutAll() {
    try {
      const response = await api.post('/api/auth/logout-all', {});
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors || [];
      const message = errors.join('\n') || error.response?.data?.message || 'Validation error';
      return new Error(message);
    }
    return error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
}

export const authService = new AuthService();
