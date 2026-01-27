import { Component, computed, EventEmitter, input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { OrderItem } from '../../../../../models/orders';
import { Event } from '../../../../../models/events';

import { ConfirmDialog } from '../../../../../shared/ui/dialog/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-order-items-editor',
  imports: [FormsModule, DecimalPipe, ConfirmDialog],
  templateUrl: './order-items-editor.html',
  styleUrl: './order-items-editor.css',
})
export class OrderItemsEditor {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  items = input.required<OrderItem[]>();
  canEdit = input<boolean>(false);
  savingItems = input<boolean>(false);
  availableEvents = input<Event[]>([]);
  eventsLoading = input<boolean>(false);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() increase = new EventEmitter<number>();
  @Output() decrease = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<{ index: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<{ eventId: string; quantity: number }>();
  @Output() saveItems = new EventEmitter<void>();

  // ==========================================
  // LOCAL UI STATE (Add Item Form)
  // ==========================================
  selectedEventId = signal<string | null>(null);
  newItemQuantity = signal<number>(1);
  removeIndex = signal<number | null>(null);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  totalTickets = computed(() => {
    return this.items().reduce((sum, i) => sum + i.quantity, 0);
  });

  subtotal = computed(() => {
    return this.items().reduce((sum, i) => sum + i.lineTotal, 0);
  });

  // ==========================================
  // QUANTITY HANDLERS
  // ==========================================

  onQuantityInput(index: number, value: string | number): void {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return;
    this.quantityChange.emit({ index, quantity: num });
  }

  // ==========================================
  // REMOVE ITEM ACTIONS
  // ==========================================

  openRemoveModal(index: number): void {
    if (!this.canEdit() || this.savingItems()) return;
    this.removeIndex.set(index);
  }

  closeRemoveModal(): void {
    this.removeIndex.set(null);
  }

  confirmRemove(): void {
    const i = this.removeIndex();
    if (i === null) return;
    this.remove.emit(i);
    this.removeIndex.set(null);
  }

  // ==========================================
  // ADD ITEM ACTIONS
  // ==========================================

  onAddItem(): void {
    if (!this.canEdit()) return;

    const eventId = this.selectedEventId();
    const qty = this.newItemQuantity();

    if (!eventId) return;
    if (!qty || qty < 1) return;

    this.addItem.emit({ eventId, quantity: qty });

    this.selectedEventId.set(null);
    this.newItemQuantity.set(1);
  }
}
