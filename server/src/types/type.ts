import type { Request } from 'express';
import type { IUser } from '../interfaces/interfaces.js';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  sessionId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  errors?: string[] | undefined;
}

export interface SessionData {
  userId: string | undefined;
  email: string | undefined;
  role: UserRole;
  createdAt: number;
  lastActive: number;
  ipAddress?: string | undefined;
  userAgent?: string | undefined
}
