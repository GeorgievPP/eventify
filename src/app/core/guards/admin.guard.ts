import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';

import { AuthService } from '../services/auth';
import { NotificationService } from '../services/ui';


export const adminGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  // ==========================================
  // PERMISSION CHECK
  // ==========================================

  if (authService.isStaff()) {
    return true;
  }

  // ==========================================
  // UNAUTHORIZED - REDIRECT
  // ==========================================

  notifications.showError('You do not have permission to access this page.');

  router.navigate(['/home']);

  return false;
};