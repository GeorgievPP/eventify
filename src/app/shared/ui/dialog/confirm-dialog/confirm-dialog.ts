import { Component, EventEmitter, input, Output } from '@angular/core';


@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  open = input<boolean>(false);
  title = input<string>('Confirm');
  message = input<string>('');
  cancelText = input<string>('Cancel');
  confirmText = input<string>('Confirm');
  variant = input<'default' | 'danger'>('default');
  confirmDisabled = input<boolean>(false);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}