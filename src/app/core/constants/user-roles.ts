import { UserRole } from '../../models/auth';

export const VALID_USER_ROLES: readonly UserRole[] = ['user', 'admin', 'poweruser'] as const;
