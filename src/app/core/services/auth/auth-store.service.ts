import { computed, Injectable, signal } from '@angular/core';

import { AuthUser, UserRole } from '../../../models/auth';

import { STORAGE_KEYS, VALID_USER_ROLES } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private readonly STORAGE_KEY = STORAGE_KEYS.USER;

  private readonly _user = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly userId = computed(() => this._user()?._id ?? null);
  readonly userEmail = computed(() => this._user()?.email ?? null);
  readonly userRole = computed(() => this._user()?.role ?? null);
  readonly accessToken = computed(() => this._user()?.accessToken ?? null);

  readonly isAdmin = computed(() => this.userRole() === 'admin');
  readonly isPowerUser = computed(() => this.userRole() === 'poweruser');
  readonly isStaff = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'poweruser';
  });

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  setUser(user: AuthUser | null): void {
    this.saveUser(user);
    this._user.set(user);

    if (user) {
      console.log(`[AuthStore] User set: ${user.email} (${user.role})`);
    } else {
      console.log('[AuthStore] User cleared');
    }
  }

  clearUser(): void {
    this.setUser(null);
  }

  // ==========================================
  // PUBLIC HELPER METHODS
  // ==========================================
  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  // ==========================================
  // PRIVATE PERSISTENCE METHODS
  // ==========================================

  private saveUser(user: AuthUser | null): void {
    try {
      if (user) {
        const serialized = JSON.stringify(user);
        localStorage.setItem(this.STORAGE_KEY, serialized);
        console.log(`[AuthStore] User persisted: ${user.email}`);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('[AuthStore] User removed from storage');
      }
    } catch (error) {
      console.error('[AuthStore] Error persisting user to storage:', error);
    }
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);

      if (!raw) {
        console.log('[AuthStore] No stored user found');
        return null;
      }

      const parsed = JSON.parse(raw);

      if (this.isValidUserStructure(parsed)) {
        console.log(`[AuthStore] User restored from storage: ${parsed.email}`);
        return parsed;
      }

      console.warn('[AuthStore] Invalid user data in localStorage, clearing');
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('[AuthStore] Error loading user from storage:', error);

      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (cleanupError) {
        console.error('[AuthStore] Error cleaning up storage:', cleanupError);
      }

      return null;
    }
  }

  private isValidUserStructure(obj: any): obj is AuthUser {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj._id !== 'string' || obj._id.length === 0) {
      console.warn('[AuthStore] Invalid user: missing or empty _id');
      return false;
    }

    if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
      console.warn('[AuthStore] Invalid user: invalid email');
      return false;
    }

    if (typeof obj.accessToken !== 'string' || obj.accessToken.length === 0) {
      console.warn('[AuthStore] Invalid user: missing or empty accessToken');
      return false;
    }

    if (typeof obj.role !== 'string') {
      console.warn('[AuthStore] Invalid user: invalid role');
      return false;
    }

    if (!VALID_USER_ROLES.includes(obj.role)) {
      console.warn(`[AuthStore] Invalid user: unknown role '${obj.role}'`);
      return false;
    }

    return true;
  }
}
