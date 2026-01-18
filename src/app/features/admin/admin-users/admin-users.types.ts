import { UserRole } from "../../../models/auth";
import { AdminUser } from "../../../models/users";


export type UserStatusFilter = 'all' | 'active' | 'deleted';

export type UserModalMode = 'delete' | 'restore';

export type ModalUser = Pick<AdminUser, '_id' | 'email' | 'isDeleted'>;

export type RoleChangePayload = { userId: string; newRole: UserRole };
export type UserActionPayload = { user: AdminUser };