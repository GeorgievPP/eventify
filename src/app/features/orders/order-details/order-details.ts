import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderApiService, OrderService } from '../../../core/services/orders';
import { NotificationService } from '../../../core/services/ui';
import { AuthService } from '../../../core/services/auth';
import { EventApiService } from '../../../core/services/events';

import { Order, OrderHistoryEntry, OrderItem, OrderStatus } from '../../../models/orders';
import { Event } from '../../../models/events';

import { OrderSummary } from './components/order-summary/order-summary';
import { OrderStatusActions } from './components/order-status-actions/order-status-actions';
import { OrderItemsEditor } from './components/order-items-editor/order-items-editor';
import { OrderHistory } from './components/order-history/order-history';


@Component({
  selector: 'app-order-details',
  imports: [
    RouterLink,
    FormsModule,
    OrderSummary,
    OrderStatusActions,
    OrderItemsEditor,
    OrderHistory,
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(OrderApiService);
  private ordersService = inject(OrderService);
  private notifications = inject(NotificationService);
  private auth = inject(AuthService);
  private eventApi = inject(EventApiService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  isStaff = this.auth.isStaff;
  isAdmin = this.auth.isAdmin;

  // ==========================================
  // ORDER STATE
  // ==========================================
  order = signal<Order | null>(null);
  loading = signal(false);
  history = signal<OrderHistoryEntry[]>([]);
  historyLoading = signal(false);

  // ==========================================
  // STATUS MANAGEMENT STATE
  // ==========================================
  savingStatus = signal(false);
  cancelling = signal(false);
  selectedStatus = signal<OrderStatus | null>(null);

  readonly statusOptions: OrderStatus[] = [
    'pending',
    'processing',
    'paid',
    'completed',
    'cancelled',
    'refunded',
  ];

  // ==========================================
  // ITEMS EDITOR STATE
  // ==========================================
  editableItems = signal<OrderItem[]>([]);
  savingItems = signal(false);
  availableEvents = signal<Event[]>([]);
  eventsLoading = signal(false);

  // ==========================================
  // COMPUTED PROPERTIES (Permissions)
  // ==========================================

  private isFinalStatus = computed(() => {
    const o = this.order();
    if (!o) return false;
    return ['cancelled', 'refunded', 'completed'].includes(o.status);
  });

  canChangeStatus = computed(() => {
    return this.isStaff() && !this.isFinalStatus();
  });

  canCancel = computed(() => {
    return this.isStaff() && !this.isFinalStatus();
  });

  canEditItems = computed(() => {
    return this.isStaff() && !this.isFinalStatus();
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notifications.showError('Invalid order id.');
      this.router.navigate(['/orders']);
      return;
    }

    this.loadOrder(id);
    this.loadHistory(id);

    if (this.isStaff()) {
      this.loadAvailableEvents();
    }
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private loadOrder(id: string): void {
    this.loading.set(true);

    this.api
      .getOrderById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.loading.set(false);

          this.selectedStatus.set(order.status);
          this.editableItems.set(order.items.map((it) => ({ ...it })));
        },
        error: (err) => {
          console.error('[OrderDetails] Error loading order', err);
          this.loading.set(false);
          this.notifications.showError('Failed to load order details.');
          this.router.navigate(['/orders']);
        },
      });
  }


  private loadHistory(id: string): void {
    this.historyLoading.set(true);

    this.api
      .getOrderHistory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.history.set(entries);
          this.historyLoading.set(false);
        },
        error: (err) => {
          console.error('[OrderDetails] Error loading order history', err);
          this.historyLoading.set(false);
          this.notifications.showError('Failed to load order history.');
        },
      });
  }


  private loadAvailableEvents(): void {
    this.eventsLoading.set(true);

    this.eventApi
      .getAllEventsDesc()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.availableEvents.set(events);
          this.eventsLoading.set(false);
        },
        error: (err) => {
          console.error('[OrderDetails] Error loading events for Add Item', err);
          this.eventsLoading.set(false);
          this.notifications.showError('Failed to load events for Add Item.');
        },
      });
  }

  // ==========================================
  // STATUS ACTIONS
  // ==========================================

  onStatusChange(newStatus: string): void {
    this.selectedStatus.set(newStatus as OrderStatus);
  }

  saveStatus(): void {
    const o = this.order();
    const newStatus = this.selectedStatus();

    if (!o || !newStatus) return;
    if (o.status === newStatus) return;
    if (!this.canChangeStatus()) return;

    const confirmChange = confirm(`Change status from ${o.status} to ${newStatus}?`);
    if (!confirmChange) return;

    this.savingStatus.set(true);

    this.ordersService
      .updateOrderStatus(o.id, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.savingStatus.set(false);

          this.selectedStatus.set(updated.status);
          this.editableItems.set(updated.items.map((it) => ({ ...it })));

          this.notifications.showSuccess('Order status updated.');
          this.loadHistory(updated.id);
        },
        error: (err) => {
          console.error('[OrderDetails] Error updating status', err);
          this.savingStatus.set(false);
          this.notifications.showError('Failed to update order status.');
        },
      });
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o || !this.canCancel()) return;

    const confirmCancel = confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    this.cancelling.set(true);

    this.ordersService
      .cancelOrder(o.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.cancelling.set(false);

          this.selectedStatus.set(updated.status);
          this.editableItems.set(updated.items.map((it) => ({ ...it })));

          this.notifications.showSuccess('Order cancelled.');
          this.loadHistory(updated.id);
        },
        error: (err) => {
          console.error('[OrderDetails] Error cancelling order', err);
          this.cancelling.set(false);
          this.notifications.showError('Failed to cancel order.');
        },
      });
  }

  // ==========================================
  // ITEMS EDITOR ACTIONS
  // ==========================================

  saveItems(): void {
    const o = this.order();
    if (!o || !this.canEditItems()) return;

    const items = this.editableItems();
    if (!items.length) {
      const confirmEmpty = confirm('This will remove all items from the order. Continue?');
      if (!confirmEmpty) return;
    }

    const payload = items.map((it) => ({
      eventId: it.eventId,
      quantity: it.quantity,
    }));

    this.savingItems.set(true);

    this.ordersService
      .updateOrderItems(o.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.editableItems.set(updated.items.map((it) => ({ ...it })));
          this.savingItems.set(false);

          this.notifications.showSuccess('Order items updated.');
          this.loadHistory(updated.id);
        },
        error: (err) => {
          console.error('[OrderDetails] Error updating items', err);
          this.savingItems.set(false);
          this.notifications.showError('Failed to update order items.');
        },
      });
  }

  private updateItemQuantity(index: number, newQuantity: number): void {
    if (newQuantity < 1) newQuantity = 1;

    this.editableItems.update((items) => {
      const copy = items.map((it) => ({ ...it }));
      const item = copy[index];
      if (!item) return items;

      item.quantity = newQuantity;
      item.lineTotal = item.unitPrice * newQuantity;
      return copy;
    });
  }

  increaseItem(index: number): void {
    const current = this.editableItems()[index];
    if (!current || !this.canEditItems()) return;

    this.updateItemQuantity(index, current.quantity + 1);
  }

  decreaseItem(index: number): void {
    const current = this.editableItems()[index];
    if (!current || !this.canEditItems()) return;

    if (current.quantity <= 1) return;
    this.updateItemQuantity(index, current.quantity - 1);
  }

  onQuantityInput(index: number, value: string | number): void {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return;
    this.updateItemQuantity(index, num);
  }

  removeItem(index: number): void {
    if (!this.canEditItems()) return;

    this.editableItems.update((items) => {
      const copy = items.slice();
      copy.splice(index, 1);
      return copy;
    });
  }

  addItem(payload: { eventId: string; quantity: number }): void {
    const o = this.order();
    if (!o || !this.canEditItems()) return;

    const eventId = payload.eventId;
    const qty = payload.quantity;

    const event = this.availableEvents().find((e) => e._id === eventId);
    if (!event) {
      this.notifications.showError('Selected event not found.');
      return;
    }

    const unitPrice = event.price ?? 0;

    this.editableItems.update((items) => {
      const existingIndex = items.findIndex(
        (it) => it.eventId === eventId || it.title === event.title,
      );
      const copy = items.map((it) => ({ ...it }));

      if (existingIndex >= 0) {
        const item = copy[existingIndex];
        item.quantity += qty;
        item.lineTotal = item.unitPrice * item.quantity;
        return copy;
      }

      return [
        ...copy,
        {
          eventId: event._id,
          title: event.title,
          unitPrice,
          quantity: qty,
          lineTotal: unitPrice * qty,
        },
      ];
    });
  }
}