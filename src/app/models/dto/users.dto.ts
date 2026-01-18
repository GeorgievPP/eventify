import { UserRole } from "../auth";

export interface UserDto {
  _id: string;
  email: string;
  role: UserRole;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRoleDto {
  message: string;
  user: {
    id?: string;
    _id?: string;
    email: string;
    role: UserRole;
  };
}
