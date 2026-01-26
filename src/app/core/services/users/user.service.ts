import { computed, inject, Injectable, signal } from '@angular/core';
import { UserApiService } from './user-api.service';
import { UserStoreService } from './user-store.service';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { AdminUser } from '../../../models/users';
import { UserRole } from '../../../models/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private readonly api = inject(UserApiService);
  private readonly store = inject(UserStoreService);

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _isOperating = signal(false);
  readonly isOperating = computed(() => this._isOperating());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  // ==========================================
  // EXPOSE STORE PROPERTIES
  // ==========================================
  readonly users = this.store.users;
  readonly totalUsers = this.store.totalUsers;
  readonly isEmpty = this.store.isEmpty;
  readonly activeUsersCount = this.store.activeUsersCount;
  readonly deletedUsersCount = this.store.deletedUsersCount;
  readonly adminCount = this.store.adminCount;
  readonly powerUserCount = this.store.powerUserCount;
  readonly regularUserCount = this.store.regularUserCount;

  // ==========================================
  // LOAD OPERATIONS
  // ==========================================

  loadUsers(): Observable<AdminUser[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.api.getUsers().pipe(
      tap((users) => {
        this.store.setUsers(users);
        console.log(`[UserService] Loaded ${users.length} users`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[UserService] Load users failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  // ==========================================
  // UPDATE OPERATIONS
  // ==========================================

  updateUserRole(userId: string, role: UserRole): Observable<AdminUser> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateUserRole(userId, role).pipe(
      tap((updatedUser) => {
        this.store.updateUser(updatedUser);
        this._lastOperationSuccess.set(true);
        console.log(`[UserService] User role updated: ${userId} → ${role}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[UserService] Update role failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // DELETE OPERATIONS
  // ==========================================

  softDeleteUser(userId: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.softDeleteUser(userId).pipe(
      tap(() => {
        this.store.markUserAsDeleted(userId);
        this._lastOperationSuccess.set(true);
        console.log(`[UserService] User soft-deleted: ${userId}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[UserService] Soft delete failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  restoreUser(userId: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.restoreUser(userId).pipe(
      tap(() => {
        this.store.restoreUser(userId);
        this._lastOperationSuccess.set(true);
        console.log(`[UserService] User restored: ${userId}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[UserService] Restore failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  clearError(): void {
    this._error.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  clearUsers(): void {
    this.store.clearUsers();
  }

  // ==========================================
  // STORE QUERY HELPERS (Delegation)
  // ==========================================

  getUserById(userId: string): AdminUser | null {
    return this.store.getUserById(userId);
  }

  getActiveUsers(): AdminUser[] {
    return this.store.getActiveUsers();
  }

  getDeletedUsers(): AdminUser[] {
    return this.store.getDeletedUsers();
  }

  getUsersByRole(role: UserRole): AdminUser[] {
    return this.store.getUsersByRole(role);
  }

  getAdmins(): AdminUser[] {
    return this.store.getAdmins();
  }

  getPowerUsers(): AdminUser[] {
    return this.store.getPowerUsers();
  }

  getRegularUsers(): AdminUser[] {
    return this.store.getRegularUsers();
  }

  searchUsersByEmail(query: string): AdminUser[] {
    return this.store.searchUsersByEmail(query);
  }

  getUserByEmail(email: string): AdminUser | null {
    return this.store.getUserByEmail(email);
  }

  getRecentUsers(limit?: number): AdminUser[] {
    return this.store.getRecentUsers(limit);
  }

  getUsersSortedByEmail(ascending?: boolean): AdminUser[] {
    return this.store.getUsersSortedByEmail(ascending);
  }

  getUsersInDateRange(startDate: Date, endDate: Date): AdminUser[] {
    return this.store.getUsersInDateRange(startDate, endDate);
  }

  getTodayUsers(): AdminUser[] {
    return this.store.getTodayUsers();
  }

  emailExists(email: string): boolean {
    return this.store.emailExists(email);
  }

  getStatistics() {
    return this.store.getStatistics();
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private extractErrorMessage(error: any): string {
    if (error?.message && !error.message.startsWith('Http failure')) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Unauthorized. Please login.';
        case 403:
          return 'Access forbidden. Admin rights required.';
        case 404:
          return 'User not found.';
        case 409:
          return 'Conflict. Operation cannot be completed.';
        case 500:
          return 'Server error. Please try again later.';
        case 0:
          return 'Cannot connect to server. Check your internet connection.';
        default:
          return error.statusText || 'An unexpected error occurred.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
