import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../constants';
import { AdminUser } from '../../../models/users';
import { ApiResponse } from '../../../models/shared';
import { UserRole } from '../../../models/auth';
import { UpdateUserRoleDto, UserDto } from '../../../models/dto';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  // GET /users – списък с всички потребители (admin only)
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<ApiResponse<UserDto[]>>(`${this.baseUrl}/users`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load users');
        }

        return res.data.map((u) => this.mapUser(u));
      }),
    );
  }

  // PATCH /users/:id/role – сменя ролята на user
  updateUserRole(userId: string, role: UserRole): Observable<AdminUser> {
    return this.http
      .patch<ApiResponse<UpdateUserRoleDto>>(`${this.baseUrl}/users/${userId}/role`, { role })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to update user role');
          }

          const u = res.data.user;

          console.log('[updateUserRole] response:', res);

          const updated: AdminUser = {
            _id: u._id ?? u.id ?? userId,
            email: u.email,
            role: u.role,
            isDeleted: false,
          };

          return updated;
        }),
      );
  }

  // DELETE /users/:id – soft delete (admin only)
  softDeleteUser(userId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/users/${userId}`)
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(res.error?.message || 'Failed to delete user');
          }
        }),
      );
  }

  // PATCH /users/:id/restore – restore soft-deleted user (admin only)
  restoreUser(userId: string): Observable<void> {
    return this.http
      .patch<
        ApiResponse<{ message: string; user: UserDto }>
      >(`${this.baseUrl}/users/${userId}/restore`, {})
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(res.error?.message || 'Failed to restore user');
          }
        }),
      );
  }

  private mapUser(u: UserDto): AdminUser {
    return {
      _id: u._id,
      email: u.email,
      role: u.role,
      isDeleted: u.isDeleted ?? false,
      deletedAt: u.deletedAt ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
