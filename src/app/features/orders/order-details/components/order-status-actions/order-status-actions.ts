import { Component, EventEmitter, input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrderStatus } from '../../../../../models/orders';

import { ConfirmDialog } from '../../../../../shared/ui/dialog/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-order-status-actions',
  imports: [ConfirmDialog, FormsModule],
  templateUrl: './order-status-actions.html',
  styleUrl: './order-status-actions.css',
})
export class OrderStatusActions {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  canChangeStatus = input<boolean>(false);
  canCancel = input<boolean>(false);
  selectedStatus = input<OrderStatus | null>(null);
  statusOptions = input<OrderStatus[]>([]);
  savingStatus = input<boolean>(false);
  cancelling = input<boolean>(false);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() selectedStatusChange = new EventEmitter<OrderStatus>();
  @Output() save = new EventEmitter<void>();
  @Output() cancelConfirm = new EventEmitter<void>();

  // ==========================================
  // LOCAL UI STATE
  // ==========================================
  cancelModalOpen = signal(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onStatusChange(value: OrderStatus): void {
    this.selectedStatusChange.emit(value);
  }

  openCancelModal(): void {
    if (!this.canCancel() || this.cancelling()) return;
    this.cancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    this.cancelModalOpen.set(false);
  }

  confirmCancel(): void {
    this.cancelModalOpen.set(false);
    this.cancelConfirm.emit();
  }
}
