// src/types/auth.ts

export type UserRole = 'guest' | 'user' | 'vip' | 'admin';

export interface UserSession {
  id: number;
  email: string;
  name: string;
  credits: number;
  role: UserRole;
  image?: string | null;
}

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}