export interface LoginRequest { email: string; password: string; }
export interface AuthResponse {
  token: string; expiresAt: string; userId: number;
  email: string; fullName: string; roles: string[]; permissions: string[];
}
export interface CurrentUser {
  userId: string; email: string; fullName: string;
  roles: string[]; permissions: string[];
}
