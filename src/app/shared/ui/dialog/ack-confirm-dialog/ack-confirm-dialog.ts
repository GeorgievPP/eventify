import { Component, EventEmitter, input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-ack-confirm-dialog',
  imports: [],
  templateUrl: './ack-confirm-dialog.html',
  styleUrl: './ack-confirm-dialog.css',
})
export class AckConfirmDialog {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  open = input<boolean>(false);
  title = input<string>('Confirm');
  message = input<string>('');
  ackLabel = input<string>('I understand');
  cancelText = input<string>('Cancel');
  confirmText = input<string>('Confirm');
  variant = input<'default' | 'danger'>('default');

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  // ==========================================
  // LOCAL STATE
  // ==========================================
  ack = signal(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onOpenChange(open: boolean): void {
    if (open) this.ack.set(false);
  }

  onCancel(): void {
    this.ack.set(false);
    this.cancel.emit();
  }

  onConfirm(): void {
    if (!this.ack()) return;
    this.confirm.emit();
    this.ack.set(false);
  }
}