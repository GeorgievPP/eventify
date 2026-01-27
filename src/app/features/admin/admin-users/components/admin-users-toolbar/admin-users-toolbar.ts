import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserStatusFilter } from '../../admin-users.types';


@Component({
  selector: 'app-admin-users-toolbar',
  imports: [FormsModule],
  templateUrl: './admin-users-toolbar.html',
  styleUrl: './admin-users-toolbar.css',
})
export class AdminUsersToolbar {
  // ==========================================
  // INPUTS 
  // ==========================================
  searchTerm = input.required<string>();
  statusFilter = input.required<UserStatusFilter>();
  resultsCount = input<number>(0);
  totalCount = input<number>(0);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<UserStatusFilter>();
  @Output() reset = new EventEmitter<void>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onStatusChange(value: UserStatusFilter): void {
    this.statusFilterChange.emit(value);
  }

  onReset(): void {
    this.reset.emit();
  }
}