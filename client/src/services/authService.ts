import { authApi } from "../api/authApi";
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
    try { return await authApi.register(d); }
    catch(e:any) { throw this.he(e); }
  }
  
  async login(d:LoginData) {
    try { return await authApi.login(d); }
    catch(e:any) { throw this.he(e); }
  }
  async getMe() {
    try { return await authApi.getMe(); }
    catch(e:any) { throw this.he(e); }
  }
  async logout() { return await authApi.logout(); }
  async logoutAll() { return await authApi.logoutAll(); }
  async sendOtp(email: string) {
    try { return await authApi.sendOtp(email); }
    catch(e:any) { throw this.he(e); }
  }
  async verifyOtp(d:VerifyOtpData) {
    try { return await authApi.verifyOtp(d); }
    catch(e:any) { throw this.he(e); }
  }
  async resendOtp(email: string) {
    try { return await authApi.resendOtp(email); }
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
