import type { Request } from 'express';
import type { IUser } from '../interfaces/interfaces.js';
 

 
export interface JwtAccessPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}
 
export interface JwtRefreshPayload {
  userId: string;
  sessionId: string;
}
 

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}
 

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}
 

export interface RegisterBody {
  firstName: string;
  email: string;
  password: string;
  role?: UserRole;
}
 
export interface LoginBody {
  email: string;
  password: string;
}
 
export interface VerifyOtpBody {
  email: string;
  otp: string;
}
 
export interface ResendOtpBody {
  email: string;
}
 
export interface GoogleLoginBody {
  idToken: string;         // ID token from Google Sign-In
}
 
// ─── Extended Request ─────────────────────────────────────────────────────────
 
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  sessionId?: string;
}
 
// ─── API Response ─────────────────────────────────────────────────────────────
 
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  errors?: string[] | undefined;
}
 
// ─── Session Data (stored in Redis) ──────────────────────────────────────────
 
export interface SessionData {
  userId: string | undefined;
  email: string | undefined;
  role: UserRole;
  createdAt: number;
  lastActive: number;
ipAddress?: string | undefined;
  userAgent?: string | undefined
}
 

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR = 'two_factor',
}
