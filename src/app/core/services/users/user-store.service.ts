import { computed, Injectable, signal } from '@angular/core';

import { AdminUser } from '../../../models/users';
import { UserRole } from '../../../models/auth';


@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  // ==========================================
  // PRIVATE STATE
  // ==========================================
  private readonly _users = signal<AdminUser[]>([]);
  // ==========================================
  // PUBLIC COMPUTED PROPERTIES
  // ==========================================
  readonly users = computed(() => this._users());
  readonly totalUsers = computed(() => this._users().length);
  readonly isEmpty = computed(() => this._users().length === 0);
  readonly activeUsersCount = computed(() => this._users().filter((u) => !u.isDeleted).length);
  readonly deletedUsersCount = computed(() => this._users().filter((u) => u.isDeleted).length);

  readonly adminCount = computed(
    () => this._users().filter((u) => !u.isDeleted && u.role === 'admin').length,
  );

  readonly powerUserCount = computed(
    () => this.users().filter((u) => !u.isDeleted && u.role === 'poweruser').length,
  );

  readonly regularUserCount = computed(
    () => this._users().filter((u) => !u.isDeleted && u.role === 'user').length,
  );

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  setUsers(users: AdminUser[]): void {
    this._users.set(users);
    console.log(`[UserStore] Users set: ${users.length} users`);
  }

  updateUser(updatedUser: AdminUser): void {
    this._users.update((users) => {
      const index = users.findIndex((u) => u._id === updatedUser._id);

      if (index === -1) {
        console.log(`[UserStore] User not in list, adding: ${updatedUser._id}`);
        return [updatedUser, ...users];
      }

      // Replace existing user
      const newUsers = [...users];
      newUsers[index] = updatedUser;
      console.log(`[UserStore] User updated: ${updatedUser.email}`);
      return newUsers;
    });
  }

  updateUserRole(userId: string, role: UserRole): void {
    this._users.update((users) =>
      users.map((user) => (user._id === userId ? { ...user, role } : user)),
    );

    console.log(`[UserStore] User role updated: ${userId} → ${role}`);
  }

  markUserAsDeleted(userId: string): void {
    this._users.update((users) =>
      users.map((user) =>
        user._id === userId
          ? { ...user, isDeleted: true, deletedAt: new Date().toISOString() }
          : user,
      ),
    );

    console.log(`[UserStore] User marked as deleted: ${userId}`);
  }

  restoreUser(userId: string): void {
    this._users.update((users) =>
      users.map((user) =>
        user._id === userId ? { ...user, isDeleted: false, deletedAt: null } : user,
      ),
    );

    console.log(`[UserStore] User restored: ${userId}`);
  }

  removeUser(userId: string): void {
    this._users.update((users) => {
      const user = users.find((user) => user._id === userId);
      if (user) {
        console.log(`[UserStore] User removed: ${user.email}`);
      }

      return users.filter((user) => user._id !== userId);
    });
  }

  clearUsers(): void {
    this._users.set([]);
    console.log('[UserStore] All users cleared');
  }

  // ==========================================
  // PUBLIC QUERY METHODS
  // ==========================================

  getUserById(userId: string): AdminUser | null {
    return this._users().find((user) => user._id === userId) ?? null;
  }

  getActiveUsers(): AdminUser[] {
    return this._users().filter((user) => !user.isDeleted);
  }

  getDeletedUsers(): AdminUser[] {
    return this._users().filter((user) => user.isDeleted);
  }

  getUsersByRole(role: UserRole): AdminUser[] {
    return this._users().filter((user) => !user.isDeleted && user.role === role);
  }

  getAdmins(): AdminUser[] {
    return this.getUsersByRole('admin');
  }

  getPowerUsers(): AdminUser[] {
    return this.getUsersByRole('poweruser');
  }

  getRegularUsers(): AdminUser[] {
    return this.getUsersByRole('user');
  }

  searchUsersByEmail(query: string): AdminUser[] {
    const lowerQuery = query.toLowerCase();
    return this._users().filter(
      (user) => !user.isDeleted && user.email.toLowerCase().includes(lowerQuery),
    );
  }

  getUserByEmail(email: string): AdminUser | null {
    const lowerEmail = email.toLowerCase();
    return this._users().find((user) => user.email.toLowerCase() === lowerEmail) ?? null;
  }

  getRecentUsers(limit: number = 10): AdminUser[] {
    return [...this._users()]
      .filter((user) => !user.isDeleted)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  getUsersSortedByEmail(ascending: boolean = true): AdminUser[] {
    return [...this._users()]
      .filter((user) => !user.isDeleted)
      .sort((a, b) =>
        ascending ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
      );
  }

  getUsersInDateRange(startDate: Date, endDate: Date): AdminUser[] {
    const start = startDate.getTime();
    const end = endDate.getTime();

    return this._users().filter((user) => {
      const created = new Date(user.createdAt!).getTime();
      return created >= start && created <= end;
    });
  }

  getTodayUsers(): AdminUser[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getUsersInDateRange(today, tomorrow);
  }

  emailExists(email: string): boolean {
    const lowerEmail = email.toLowerCase();

    return this._users().some((user) => user.email.toLowerCase() === lowerEmail);
  }

  getStatistics(): {
    total: number;
    active: number;
    deleted: number;
    admins: number;
    powerUsers: number;
    regularUsers: number;
    createdToday: number;
    createdThisWeek: number;
  } {
    const users = this._users();
    const active = users.filter((u) => !u.isDeleted);

    const todayUsers = this.getTodayUsers();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekUsers = this.getUsersInDateRange(weekAgo, new Date());

    return {
      total: users.length,
      active: active.length,
      deleted: users.filter((u) => u.isDeleted).length,
      admins: active.filter((u) => u.role === 'admin').length,
      powerUsers: active.filter((u) => u.role === 'poweruser').length,
      regularUsers: active.filter((u) => u.role === 'user').length,
      createdToday: todayUsers.length,
      createdThisWeek: weekUsers.length,
    };
  }
}
