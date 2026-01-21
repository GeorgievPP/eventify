import { UserRole } from "../auth";

export interface AuthApiUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthApiData {
  token: string;
  user: AuthApiUser;
}