import { api } from "../utils/api";
export interface RegisterData { name:string; email:string; password:string; confirmPassword:string; }
export interface LoginData { email:string; password:string; }
export interface VerifyOtpData { email:string; otp:string; }
export interface ResendOtpData { email:string; }
export interface AuthResponse {
  success:boolean; message:string;
  data:{ sessionId:string; user:{id:string;email:string;name:string} };
}
class AuthService {
  async register(d:RegisterData) {
    try { return (await api.post('/api/auth/register', d)).data; }
    catch(e:any) { throw this.he(e); }
  }
  async login(d:LoginData) {
    try { return (await api.post('/api/auth/login', d)).data; }
    catch(e:any) { throw this.he(e); }
  }
  async getMe() {
    try { return (await api.get('/api/auth/me')).data; }
    catch(e:any) { throw this.he(e); }
  }
  async logout() { return (await api.post('/api/auth/logout',{})).data; }
  async logoutAll() { return (await api.post('/api/auth/logout-all',{})).data; }
  async sendOtp(email: string) {
    try { return (await api.post('/api/auth/send-otp', { email })).data; }
    catch(e:any) { throw this.he(e); }
  }
  async verifyOtp(d:VerifyOtpData) {
    try { return (await api.post('/api/auth/verify-otp', d)).data; }
    catch(e:any) { throw this.he(e); }
  }
  async resendOtp(email: string) {
    try { return (await api.post('/api/auth/resend-otp', { email })).data; }
    catch(e:any) { throw this.he(e); }
  }
  private he(e:any) {
    if (e.response?.status===422) {
      const errors = e.response?.data?.errors || [];
      return new Error(errors.join("\n")||e.response?.data?.message||"Validation error");
    }
    return e.response?.data?.message ? new Error(e.response.data.message) : e;
  }
}
export const authService = new AuthService();
