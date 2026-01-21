import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthApiService } from './auth-api.service';
import { AuthStoreService } from './auth-store.service';

import { AuthUser, UserRole } from '../../../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly store = inject(AuthStoreService);
  private readonly router = inject(Router);

  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  readonly user = this.store.user;
  readonly isLoggedIn = this.store.isLoggedIn;
  readonly userId = this.store.userId;
  readonly userEmail = this.store.userEmail;
  readonly userRole = this.store.userRole;
  readonly accessToken = this.store.accessToken;

  readonly isAdmin = this.store.isAdmin;
  readonly isPowerUser = this.store.isPowerUser;
  readonly isStaff = this.store.isStaff;

  register(email: string, password: string, role: UserRole = 'user'): Observable<AuthUser> {
    this._isLoading.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.register(email, password, role).pipe(
      tap((user) => {
        this.store.setUser(user);
        this._lastOperationSuccess.set(true);

        console.log(`[AuthService] User registered: ${user.email} (${user.role})`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);

        console.error('[AuthService] Registration failed:', errorMessage);

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    this._isLoading.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.login(email, password).pipe(
      tap((user) => {
        this.store.setUser(user);
        this._lastOperationSuccess.set(true);

        console.log(`[AuthService] User logged in: ${user.email} (${user.role})`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);

        console.error('[AuthService] Login failed:', errorMessage);

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  logout(navigateToLogin: boolean = true): Observable<void> {
    this._isLoading.set(true);
    this._error.set(null);

    const userEmail = this.store.userEmail();

    return this.api.logout().pipe(
      tap(() => {
        this.store.clearUser();
        this._lastOperationSuccess.set(true);

        console.log(`[AuthService] User logged out: ${userEmail}`);

        if (navigateToLogin) {
          this.router.navigate(['/login']);
        }
      }),
      catchError((error) => {
        console.warn(
          '[AuthService] Server logout failed, clearing local state anyway:',
          error.message,
        );

        this.store.clearUser();

        if (navigateToLogin) {
          this.router.navigate(['/login']);
        }

        return of(void 0);
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  quickLogout(returnUrl?: string): void {
    console.log('[AuthService] Quick logout (no server call)');
    this.store.clearUser();

    const navigationExtras = returnUrl ? { queryParams: { returnUrl } } : {};

    this.router.navigate(['/login'], navigationExtras);
  }

  // ==========================================
  // PUBLIC HELPER METHODS (Delegation)
  // ==========================================

  getToken(): string | null {
    return this.store.accessToken();
  }

  getUserId(): string | null {
    return this.store.userId();
  }

  getUserRole(): UserRole | null {
    return this.store.userRole();
  }

  hasRole(role: UserRole): boolean {
    return this.store.hasRole(role);
  }

  clearError(): void {
    this._error.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  navigateAfterLogin(): void {
    if (this.isStaff()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  /**
   * Extract user-friendly error message
   */
  private extractErrorMessage(error: any): string {
    // Handle HttpErrorResponse from Angular
    if (error instanceof HttpErrorResponse) {
      // Priority 1: Backend API error message
      if (error.error?.error?.message) {
        return error.error.error.message;
      }

      // Priority 2: Backend message
      if (error.error?.message) {
        return error.error.message;
      }

      // Priority 3: HTTP status-based messages
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Invalid email or password.';
        case 403:
          return 'Access forbidden.';
        case 404:
          return 'Resource not found.';
        case 409:
          return 'User with this email already exists.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service unavailable. Please try again later.';
        case 0:
          return 'Cannot connect to server. Check your internet connection.';
        default:
          return error.statusText || 'An unexpected error occurred.';
      }
    }

    // Handle plain Error objects
    if (error?.message && !error.message.startsWith('Http failure')) {
      return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Fallback
    return 'An unexpected error occurred. Please try again.';
  }
}
