import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

import { OrderApiService } from './order-api.service';
import { OrderStoreService } from './order-store.service';

import { Order, OrderHistoryEntry, OrderStatus } from '../../../models/orders';
import { CartItem } from '../../../models/cart';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private readonly api = inject(OrderApiService);
  private readonly store = inject(OrderStoreService);

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================
  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _isLoadingSingle = signal(false);
  readonly isLoadingSingle = computed(() => this._isLoadingSingle());

  private readonly _isOperating = signal(false);
  readonly isOperating = computed(() => this._isOperating());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  // ==========================================
  // EXPOSE STORE PROPERTIES
  // ==========================================

  readonly orders = this.store.orders;
  readonly singleOrder = this.store.singleOrder;
  readonly totalOrders = this.store.totalOrders;
  readonly isEmpty = this.store.isEmpty;
  readonly hasSingleOrder = this.store.hasSingleOrder;
  readonly pendingOrdersCount = this.store.pendingOrdersCount;
  readonly processingOrdersCount = this.store.processingOrdersCount;
  readonly paidOrdersCount = this.store.paidOrdersCount;
  readonly completedOrdersCount = this.store.completedOrdersCount;
  readonly cancelledOrdersCount = this.store.cancelledOrdersCount;
  readonly refundedOrdersCount = this.store.refundedOrdersCoint;

  // ==========================================
  // COMPUTED HELPERS
  // ==========================================

  ordersForUser(userId: string | null) {
    return computed(() => {
      if (!userId) return [];
      return this.store.getOrdersForUser(userId);
    });
  }

  // ==========================================
  // LOAD OPERATIONS
  // ==========================================

  loadOrders(): Observable<Order[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.api.getOrders().pipe(
      tap((orders) => {
        this.store.setOrders(orders);
        console.log(`[OrderService] Loaded ${orders.length} orders`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Load orders failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  loadIfNeeded(): void {
    if (this.store.isEmpty()) {
      console.log('[OrderService] Loading orders (empty store)');
      this.loadOrders().subscribe();
    } else {
      console.log('[OrderService] Orders already loaded, skipping');
    }
  }

  loadSingleOrder(id: string): Observable<Order> {
    this._isLoadingSingle.set(true);
    this._error.set(null);

    return this.api.getOrderById(id).pipe(
      tap((order) => {
        this.store.setSingleOrder(order);
        console.log(`[OrderService] Loaded single order: ${order.id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Load single order failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoadingSingle.set(false);
      }),
    );
  }

  // ==========================================
  // CREATE OPERATIONS
  // ==========================================

  createOrderFromCart(cartItems: CartItem[]): Observable<Order> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    const itemsPayload = cartItems.map((ci) => ({
      eventId: ci.event._id,
      quantity: ci.quantity ?? 1,
    }));

    console.log('[OrderService] Creating order from cart:', itemsPayload);

    return this.api.createOrderFromItems(itemsPayload).pipe(
      tap((newOrder) => {
        this.store.addOrder(newOrder);
        this._lastOperationSuccess.set(true);
        console.log(`[OrderService] Order created: ${newOrder.id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Create order failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // UPDATE OPERATIONS
  // ==========================================

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateOrder(id, { status }).pipe(
      tap((updatedOrder) => {
        this.store.updateOrderInList(updatedOrder);
        this._lastOperationSuccess.set(true);
        console.log(`[OrderService] Order status updated: ${id} → ${status}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Update status failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  updateOrderItems(id: string, items: { eventId: string; quantity: number }[]): Observable<Order> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateOrder(id, { items }).pipe(
      tap((updatedOrder) => {
        this.store.updateOrderInList(updatedOrder);
        this._lastOperationSuccess.set(true);
        console.log(`[OrderService] Order items updated: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Update items failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  updateOrder(
    id: string,
    payload: {
      status?: OrderStatus;
      items?: { eventId: string; quantity: number }[];
    },
  ): Observable<Order> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateOrder(id, payload).pipe(
      tap((updatedOrder) => {
        this.store.updateOrderInList(updatedOrder);
        this._lastOperationSuccess.set(true);
        console.log(`[OrderService] Order updated: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Update order failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // CANCEL OPERATION
  // ==========================================

  cancelOrder(id: string): Observable<Order> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.cancelOrder(id).pipe(
      tap((updatedOrder) => {
        this.store.updateOrderInList(updatedOrder);
        this._lastOperationSuccess.set(true);
        console.log(`[OrderService] Order cancelled: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Cancel order failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // HISTORY OPERATION
  // ==========================================

  getOrderHistory(id: string): Observable<OrderHistoryEntry[]> {
    return this.api.getOrderHistory(id).pipe(
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[OrderService] Get history failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  clearError(): void {
    this._error.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  clearSingleOrder(): void {
    this.store.clearSingleOrder();
  }

  clearAllForUser(userId: string): void {
    this.store.removeOrdersForUser(userId);
    console.log(`[OrderService] Cleared all orders for user: ${userId}`);
  }

  clearAllOrders(): void {
    this.store.clearOrders();
  }

  // ==========================================
  // STORE QUERY HELPERS (Delegation)
  // ==========================================

  getOrderFromStore(id: string): Order | null {
    return this.store.getOrderById(id);
  }

  getOrdersForUser(userId: string): Order[] {
    return this.store.getOrdersForUser(userId);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.store.getOrdersByStatus(status);
  }

  getPendingOrders(): Order[] {
    return this.store.getPendingOrders();
  }

  getCompletedOrders(): Order[] {
    return this.store.getCompletedOrders();
  }

  getCancelledOrders(): Order[] {
    return this.store.getCancelledOrders();
  }

  getProcessingOrders(): Order[] {
    return this.store.getProcessingOrders();
  }

  getPaidOrders(): Order[] {
    return this.store.getPaidOrders();
  }

  getRefundedOrders(): Order[] {
    return this.store.getRefundedOrders();
  }

  getOrdersForEvent(eventId: string): Order[] {
    return this.store.getOrdersForEvent(eventId);
  }

  getRecentOrders(limit?: number): Order[] {
    return this.store.getRecentOrders(limit);
  }

  getOrdersByPrice(descending: boolean = true): Order[] {
    return this.store.getOrdersByPrice(descending);
  }

  getTotalRevenue(): number {
    return this.store.getTotalRevenue();
  }

  getTotalRevenueForUser(userId: string): number {
    return this.store.getTotalRevenueForUser(userId);
  }

  getOrdersContainingEvent(eventId: string): Order[] {
    return this.store.getOrdersContainingEvent(eventId);
  }

  getTotalTicketsSoldForEvent(eventId: string): number {
    return this.store.getTotalTicketsSoldForEvent(eventId);
  }

  getUserPendingOrdersCount(userId: string): number {
    return this.store.getUserPendingOrdersCount(userId);
  }

  hasUserOrdered(userId: string): boolean {
    return this.store.hasUserOrdered(userId);
  }

  hasUserCompletedOrders(userId: string): boolean {
    return this.store.hasUserCompletedOrders(userId);
  }

  getOrdersByUserEmail(email: string): Order[] {
    return this.store.getOrdersByUserEmail(email);
  }

  searchOrdersByUserEmail(query: string): Order[] {
    return this.store.searchOrdersByUserEmail(query);
  }

  getOrdersInDateRange(startDate: Date, endDate: Date): Order[] {
    return this.store.getOrdersInDateRange(startDate, endDate);
  }

  getTodayOrders(): Order[] {
    return this.store.getTodayOrders();
  }

  getStatistics() {
    return this.store.getStatistics();
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private extractErrorMessage(error: any): string {
    if (error?.message && !error.message.startsWith('Http failure')) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Unauthorized. Please login.';
        case 403:
          return 'Access forbidden.';
        case 404:
          return 'Order not found.';
        case 409:
          return 'Conflict. Order may already exist or tickets unavailable.';
        case 500:
          return 'Server error. Please try again later.';
        case 0:
          return 'Cannot connect to server. Check your internet connection.';
        default:
          return error.statusText || 'An unexpected error occurred.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
