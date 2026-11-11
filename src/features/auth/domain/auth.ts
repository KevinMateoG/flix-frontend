export type UserRole = 'admin' | 'user';



export interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  role?: UserRole;
}
export interface AuthSession {
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}
