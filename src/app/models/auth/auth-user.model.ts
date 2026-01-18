export type UserRole = 'user' | 'poweruser' | 'admin';

export interface AuthUser {
  _id: string;
  email: string;
  accessToken: string;
  role: UserRole;
}
