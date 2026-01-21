import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStoreService } from '../services/auth';
import { AUTH_ENDPOINTS } from '../constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint =
    req.url.includes(AUTH_ENDPOINTS.REGISTER) ||
    req.url.includes(AUTH_ENDPOINTS.LOGIN) ||
    req.url.includes(AUTH_ENDPOINTS.LOGOUT);

  if (isAuthEndpoint) {
    return next(req);
  }

  const store = inject(AuthStoreService);
  const token = store.accessToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
