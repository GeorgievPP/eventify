import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserApiService } from '../../../core/services/users';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/ui';
import { ExportExcelService } from '../../../core/services/export';

import { AdminUser } from '../../../models/users';
import { UserRole } from '../../../models/auth';

import { AdminUsersToolbar } from './components/admin-users-toolbar/admin-users-toolbar';
import { AdminUsersTable } from './components/admin-users-table/admin-users-table';
import { AdminUsersConfirmDialog } from './components/admin-users-confirm-dialog/admin-users-confirm-dialog';

import { ModalUser, UserModalMode, UserStatusFilter } from './admin-users.types';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, RouterLink, AdminUsersToolbar, AdminUsersTable, AdminUsersConfirmDialog],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private api = inject(UserApiService);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private exportExcel = inject(ExportExcelService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================

  isAdmin = this.authService.isAdmin;
  isStaff = this.authService.isStaff;

  // ==========================================
  // DATA STATE
  // ==========================================
  users = signal<AdminUser[]>([]);
  loading = signal(false);
  savingUserId = signal<string | null>(null);
  changingStatusUserId = signal<string | null>(null);

  readonly roles: UserRole[] = ['user', 'poweruser', 'admin'];

  // ==========================================
  // FILTER STATE
  // ==========================================
  searchTerm = signal('');
  statusFilter = signal<UserStatusFilter>('all');

  // ==========================================
  // MODAL STATE
  // ==========================================
  userModalOpen = signal(false);
  modalMode = signal<UserModalMode>('delete');
  modalUser = signal<ModalUser | null>(null);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  userStats = computed(() => {
    const all = this.users();
    return {
      total: all.length,
      active: all.filter((u) => !u.isDeleted).length,
      deleted: all.filter((u) => u.isDeleted).length,
      admins: all.filter((u) => u.role === 'admin' && !u.isDeleted).length,
      powerusers: all.filter((u) => u.role === 'poweruser' && !u.isDeleted).length,
    };
  });

  filteredUsers = computed(() => {
    const term = this.searchTerm();
    const status = this.statusFilter();
    const list = this.users();

    return list.filter((u) => {
      const matchTerm = !term || (u.email || '').toLowerCase().includes(term);
      const matchStatus =
        status === 'all' ? true : status === 'active' ? !u.isDeleted : !!u.isDeleted;

      return matchTerm && matchStatus;
    });
  });

  // ==========================================
  // STABLE FUNCTION REFERENCES (for child inputs)
  // ==========================================

  readonly isSavingFn = (userId: string) => this.isSaving(userId);

  readonly isChangingStatusFn = (userId: string) => this.isChangingStatus(userId);

  readonly statusLabelFn = (user: AdminUser) => this.statusLabel(user);

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadUsers();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  loadUsers(): void {
    this.loading.set(true);

    this.api
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AdminUsers] Error loading users:', err);
          this.loading.set(false);
          this.notifications.showError('Failed to load users.');
        },
      });
  }

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  setSearchTerm(v: string): void {
    this.searchTerm.set((v || '').trim().toLowerCase());
  }

  setStatusFilter(v: UserStatusFilter): void {
    this.statusFilter.set(v);
  }

  resetFilters(): void {
    this.setSearchTerm('');
    this.setStatusFilter('all');
  }

  // ==========================================
  // ROLE MANAGEMENT
  // ==========================================

  onRoleChange(userId: string, newRole: UserRole): void {
    if (!this.isAdmin()) {
      this.notifications.showError('Only admins can change roles.');
      return;
    }

    const current = this.users().find((u) => u._id === userId);
    if (!current || current.role === newRole) return;

    const confirmChange = confirm(
      `Change role for ${current.email} from ${current.role} to ${newRole}?`,
    );

    if (!confirmChange) return;

    this.savingUserId.set(userId);

    this.api
      .updateUserRole(userId, newRole)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingUserId.set(null);
          this.notifications.showSuccess('User role updated successfully.');
          this.loadUsers();
        },
        error: (err) => {
          console.error('[AdminUsers] Error updating user role:', err);
          this.savingUserId.set(null);
          this.notifications.showError('Failed to update user role.');
        },
      });
  }

  // ==========================================
  // USER STATUS MANAGEMENT
  // ==========================================

  onSoftDelete(user: AdminUser): void {
    if (!this.isAdmin()) {
      this.notifications.showError('Only admins can delete users.');
      return;
    }

    if (user.isDeleted) return;

    this.changingStatusUserId.set(user._id);

    this.api
      .softDeleteUser(user._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.changingStatusUserId.set(null);
          this.notifications.showSuccess('User deleted successfully.');
          this.loadUsers();
        },
        error: (err) => {
          console.error('[AdminUsers] Error deleting user:', err);
          this.changingStatusUserId.set(null);
          this.notifications.showError('Failed to delete user.');
        },
      });
  }

  onRestore(user: AdminUser): void {
    if (!this.isAdmin()) {
      this.notifications.showError('Only admins can restore users.');
      return;
    }

    if (!user.isDeleted) return;

    this.changingStatusUserId.set(user._id);

    this.api
      .restoreUser(user._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.changingStatusUserId.set(null);
          this.notifications.showSuccess('User restored successfully.');
          this.loadUsers();
        },
        error: (err) => {
          console.error('[AdminUsers] Error restoring user:', err);
          this.changingStatusUserId.set(null);
          this.notifications.showError('Failed to restore user.');
        },
      });
  }

  // ==========================================
  // EXPORT
  // ==========================================

  exportUsers(): void {
    const users = this.filteredUsers();

    if (users.length === 0) {
      this.notifications.showError('No users to export.');
      return;
    }

    const cleanUsers = users.map((u) => ({
      Email: u.email,
      Role: u.role,
      Status: u.isDeleted ? 'Deleted' : 'Active',
      'Created At': u.createdAt ? new Date(u.createdAt).toLocaleString() : '-',
      'Updated At': u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-',
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    this.exportExcel.exportToExcel(cleanUsers, `eventify-users-${timestamp}`);
    this.notifications.showSuccess(`Exported ${users.length} users to Excel.`);
  }

  // ==========================================
  // MODAL ACTIONS
  // ==========================================

  openUserModal(user: AdminUser, mode: UserModalMode): void {
    this.modalUser.set({ _id: user._id, email: user.email, isDeleted: !!user.isDeleted });
    this.modalMode.set(mode);
    this.userModalOpen.set(true);
  }

  closeUserModal(): void {
    this.userModalOpen.set(false);
    this.modalUser.set(null);
  }

  confirmUserModal(): void {
    const u = this.modalUser();
    if (!u) return;

    const mode = this.modalMode();
    this.closeUserModal();

    const full = this.users().find((x) => x._id === u._id);
    if (!full) return;

    if (mode === 'delete') this.onSoftDelete(full);
    else this.onRestore(full);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private isSaving(userId: string): boolean {
    return this.savingUserId() === userId;
  }

  private statusLabel(user: AdminUser): string {
    return user.isDeleted ? 'Deleted' : 'Active';
  }

  private isChangingStatus(userId: string): boolean {
    return this.changingStatusUserId() === userId;
  }
}
