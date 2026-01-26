import { computed, Injectable, signal } from '@angular/core';

import { Order, OrderStatus } from '../../../models/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderStoreService {
  // ==========================================
  // PRIVATE STATE
  // ==========================================
  private readonly _orders = signal<Order[]>([]);
  private readonly _singleOrder = signal<Order | null>(null);

  // ==========================================
  // PUBLIC COMPUTED PROPERTIES
  // ==========================================
  readonly orders = computed(() => this._orders());
  readonly singleOrder = computed(() => this._singleOrder());
  readonly totalOrders = computed(() => this._orders().length);
  readonly isEmpty = computed(() => this._orders().length === 0);
  readonly hasSingleOrder = computed(() => this._singleOrder() !== null);

  readonly pendingOrdersCount = computed(
    () => this._orders().filter((o) => o.status === 'pending').length,
  );

  readonly processingOrdersCount = computed(
    () => this._orders().filter((o) => o.status === 'processing').length,
  );

  readonly paidOrdersCount = computed(
    () => this._orders().filter((o) => o.status === 'paid').length,
  );

  readonly completedOrdersCount = computed(
    () => this._orders().filter((o) => o.status === 'completed').length,
  );

  readonly cancelledOrdersCount = computed(
    () => this._orders().filter((o) => o.status === 'cancelled').length,
  );

  readonly refundedOrdersCoint = computed(
    () => this._orders().filter((o) => o.status === 'refunded').length,
  );

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  setOrders(orders: Order[]): void {
    this._orders.set(orders);
    console.log(`[OrderStore] Orders set: ${orders.length} orders`);
  }

  setSingleOrder(order: Order | null): void {
    this._singleOrder.set(order);

    if (order) {
      console.log(`[OrderStore] Single order set: ${order.id}`);
      this.updateOrderInList(order);
    } else {
      console.log('[OrderStore] Single order cleared');
    }
  }

  clearSingleOrder(): void {
    this._singleOrder.set(null);
    console.log('[OrderStore] Single order cleared');
  }

  addOrder(order: Order): void {
    this._orders.update((orders) => [order, ...orders]);
    console.log(`[OrderStore] Order added: ${order.id}`);
  }

  updateOrderInList(updatedOrder: Order): void {
    this._orders.update((orders) => {
      const index = orders.findIndex((o) => o.id === updatedOrder.id);

      if (index === -1) {
        console.log(`[OrderStore] Order not in list, adding: ${updatedOrder.id}`);
        return [updatedOrder, ...orders];
      }
      const newOrders = [...orders];
      newOrders[index] = updatedOrder;
      console.log(`[OrderStore] Order updated in list: ${updatedOrder.id}`);
      return newOrders;
    });

    this._singleOrder.update((current) =>
      current && current.id === updatedOrder.id ? updatedOrder : current,
    );
  }

  removeOrder(id: string): void {
    this._orders.update((orders) => {
      const order = orders.find((o) => o.id === id);

      if (order) {
        console.log(`[OrderStore] Order removed: ${id}`);
      }

      return orders.filter((o) => o.id !== id);
    });

    this._singleOrder.update((current) => (current && current.id === id ? null : current));
  }

  removeOrdersForUser(userId: string): void {
    this._orders.update((orders) => orders.filter((o) => o.userId !== userId));
    console.log(`[OrderStore] All orders removed for user: ${userId}`);

    this._singleOrder.update((current) => (current && current.userId === userId ? null : current));
  }

  clearOrders(): void {
    this._orders.set([]);
    this._singleOrder.set(null);
    console.log('[OrderStore] All orders cleared');
  }

  // ==========================================
  // PUBLIC QUERY METHODS
  // ==========================================

  getOrderById(id: string): Order | null {
    return this._orders().find((o) => o.id === id) ?? null;
  }

  getOrdersForUser(userId: string): Order[] {
    return this._orders().filter((o) => o.userId === userId);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this._orders().filter((o) => o.status === status);
  }

  getPendingOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'pending');
  }

  getProcessingOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'processing');
  }

  getPaidOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'paid');
  }

  getCompletedOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'completed');
  }

  getCancelledOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'cancelled');
  }

  getRefundedOrders(): Order[] {
    return this._orders().filter((o) => o.status === 'refunded');
  }

  getOrdersForEvent(eventId: string): Order[] {
    return this._orders().filter((o) => o.items.some((item) => item.eventId === eventId));
  }

  getRecentOrders(limit?: number): Order[] {
    const sorted = [...this._orders()].sort((a, b) => b.createdAt - a.createdAt);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getOrdersByPrice(descending: boolean = true): Order[] {
    return [...this._orders()].sort((a, b) =>
      descending ? b.totalPrice - a.totalPrice : a.totalPrice - b.totalPrice,
    );
  }

  getTotalRevenue(): number {
    return this._orders()
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }

  getTotalRevenueForUser(userId: string): number {
    return this._orders()
      .filter((o) => o.userId === userId && o.status === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }

  getOrdersContainingEvent(eventId: string): Order[] {
    return this._orders().filter((o) => o.items.some((item) => item.eventId === eventId));
  }

  getTotalTicketsSoldForEvent(eventId: string): number {
    return this._orders()
      .filter((o) => o.status === 'completed')
      .reduce((total, order) => {
        const eventItems = order.items.filter((item) => item.eventId === eventId);
        return total + eventItems.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
  }

  getUserPendingOrdersCount(userId: string): number {
    return this._orders().filter((o) => o.userId === userId && o.status === 'pending').length;
  }

  hasUserOrdered(userId: string): boolean {
    return this._orders().some((o) => o.userId === userId);
  }

  hasUserCompletedOrders(userId: string): boolean {
    return this._orders().some((o) => o.userId === userId && o.status === 'completed');
  }

  getOrdersByUserEmail(email: string): Order[] {
    const lowerEmail = email.toLowerCase();
    return this._orders().filter((o) => o.userEmail?.toLowerCase() === lowerEmail);
  }

  searchOrdersByUserEmail(query: string): Order[] {
    const lowerQuery = query.toLowerCase();
    return this._orders().filter((o) => o.userEmail?.toLowerCase().includes(lowerQuery));
  }

  getOrdersInDateRange(startDate: Date, endDate: Date): Order[] {
    const start = startDate.getTime();
    const end = endDate.getTime();

    return this._orders().filter((o) => o.createdAt >= start && o.createdAt <= end);
  }

  getTodayOrders(): Order[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getOrdersInDateRange(today, tomorrow);
  }

  getStatistics(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  } {
    const orders = this._orders();
    const completed = orders.filter((o) => o.status === 'completed');
    const totalRevenue = completed.reduce((sum, o) => sum + o.totalPrice, 0);

    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: completed.length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      totalRevenue,
      averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
    };
  }
}
