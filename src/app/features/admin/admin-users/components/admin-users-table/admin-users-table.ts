import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminUser } from '../../../../../models/users';
import { UserRole } from '../../../../../models/auth';

import { RoleChangePayload } from '../../admin-users.types';

@Component({
  selector: 'app-admin-users-table',
  imports: [FormsModule],
  templateUrl: './admin-users-table.html',
  styleUrl: './admin-users-table.css',
})
export class AdminUsersTable {
  // ==========================================
  // INPUTS
  // ==========================================
  users = input.required<AdminUser[]>();
  isAdmin = input.required<boolean>();
  roles = input.required<UserRole[]>();
  isSaving = input.required<(userId: string) => boolean>();
  isChangingStatus = input.required<(userId: string) => boolean>();
  statusLabel = input.required<(user: AdminUser) => string>();

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() roleChange = new EventEmitter<RoleChangePayload>();
  @Output() requestDelete = new EventEmitter<AdminUser>();
  @Output() requestRestore = new EventEmitter<AdminUser>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onRoleChange(userId: string, newRole: UserRole): void {
    this.roleChange.emit({ userId, newRole });
  }

  delete(user: AdminUser): void {
    this.requestDelete.emit(user);
  }

  restore(user: AdminUser): void {
    this.requestRestore.emit(user);
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  getUserInitials(email: string): string {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'poweruser':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'user':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  }

  formatRole(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'poweruser':
        return 'Power User';
      case 'user':
        return 'User';
      default:
        return role;
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  }
}
