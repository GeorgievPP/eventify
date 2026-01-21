import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/ui';

import { AUTH_ENDPOINTS } from '../constants';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const isAuthRequest =
    req.url.includes(AUTH_ENDPOINTS.LOGIN) ||
    req.url.includes(AUTH_ENDPOINTS.REGISTER) ||
    req.url.includes(AUTH_ENDPOINTS.LOGOUT);

  if (isAuthRequest) {
    // за тези заявки не включваме глобалния loader
    return next(req);
  }
  // включваме loader-а за всяка заявка
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // винаги – при success или error – намаляваме брояча
      loadingService.hide();
    })
  );
};
