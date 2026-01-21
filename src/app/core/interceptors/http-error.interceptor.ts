import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { AUTH_ENDPOINTS } from '../constants';


export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // ==========================================
      // 401 UNAUTHORIZED
      // ==========================================
      if (error.status === 401) {
        console.warn('[HttpError] 401 Unauthorized - Token invalid or expired');

        // Don't auto-logout for public endpoints
        const isPublicEndpoint =
          req.url.includes(AUTH_ENDPOINTS.LOGIN) ||
          req.url.includes(AUTH_ENDPOINTS.REGISTER) ||
          req.url.includes(AUTH_ENDPOINTS.LOGOUT);

        const isOnLoginPage = router.url.includes('/login');

        // Auto-logout only for protected endpoints
        if (!isOnLoginPage && !isPublicEndpoint) {
          console.log('[HttpError] Auto-logout due to 401');
          authService.quickLogout(router.url);
        }
      }

      // ==========================================
      // 403 FORBIDDEN
      // ==========================================
      if (error.status === 403) {
        console.warn('[HttpError] 403 Forbidden - Insufficient permissions');
      }

      // ==========================================
      // 5XX SERVER ERRORS
      // ==========================================
      if (error.status >= 500) {
        console.error('[HttpError] Server error:', {
          status: error.status,
          message: error.message,
          url: req.url,
        });
      }

      // ==========================================
      // 0 - NETWORK ERROR
      // ==========================================
      if (error.status === 0) {
        console.error('[HttpError] Network error - Cannot reach server');
      }

      // Always re-throw error
      return throwError(() => error);
    }),
  );
};
