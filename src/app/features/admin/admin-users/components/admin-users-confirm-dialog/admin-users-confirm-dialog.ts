import { Component, EventEmitter, input, Output } from '@angular/core';

import { ModalUser, UserModalMode } from '../../admin-users.types';


@Component({
  selector: 'app-admin-users-confirm-dialog',
  imports: [],
  templateUrl: './admin-users-confirm-dialog.html',
  styleUrl: './admin-users-confirm-dialog.css',
})
export class AdminUsersConfirmDialog {
  // ==========================================
  // INPUTS
  // ==========================================
  open = input.required<boolean>();
  mode = input.required<UserModalMode>();
  user = input<ModalUser | null>(null);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}