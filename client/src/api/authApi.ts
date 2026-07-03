import { axiosInstance } from "./axoisInstance";

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  // Register new user
  register: async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  // Logout current session
  logout: async () => {
    const response = await axiosInstance.post("/auth/logout", {});
    return response.data;
  },

  // Logout all sessions
  logoutAll: async () => {
    const response = await axiosInstance.post("/auth/logout-all", {});
    return response.data;
  },

  // Send OTP to email
  sendOtp: async (email: string) => {
    const response = await axiosInstance.post("/auth/send-otp", { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string) => {
    const response = await axiosInstance.post("/auth/resend-otp", { email });
    return response.data;
  },
};