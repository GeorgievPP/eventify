import { UserRole } from "../auth";

export interface AdminUser {
  _id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}
