import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../constants';
import { AuthUser, UserRole } from '../../../models/auth';
import { ApiResponse } from '../../../models/shared';
import { AuthApiData, AuthApiUser } from '../../../models/dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;

  register(email: string, password: string, role: UserRole = 'user'): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<AuthApiData>>(`${this.apiUrl}/auth/register`, { email, password, role })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Registration failed');
          }

          const apiUser: AuthApiUser = res.data.user;
          const apiToken: string = res.data.token;

          const user: AuthUser = {
            _id: apiUser.id,
            email: apiUser.email,
            accessToken: apiToken,
            role: apiUser.role,
          };

          return user;
        }),
      );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<AuthApiData>>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Login failed');
          }

          const apiUser: AuthApiUser = res.data.user;
          const apiToken: string = res.data.token;

          const user: AuthUser = {
            _id: apiUser.id,
            email: apiUser.email,
            accessToken: apiToken,
            role: apiUser.role,
          };

          return user;
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
    .post<ApiResponse<{ message: string }>>(`${this.apiUrl}/auth/logout`, {})
    .pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message || 'Logout failed');
        }

        return;
      }),
    );
  }
}
