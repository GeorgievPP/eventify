import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth';
import { NotificationService } from '../services/ui';


export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  // ==========================================
  // AUTH CHECK
  // ==========================================
  const isLoggedIn = authService.isLoggedIn();

  if (isLoggedIn) return true;

  // ==========================================
  // NOT AUTHENTICATED - REDIRECT
  // ==========================================

  notifications.showError('You need to be logged in to access this page.');

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};