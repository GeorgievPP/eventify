import { Component, computed, input } from '@angular/core';

import { Order, OrderStatus } from '../../../../../models/orders';

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  order = input.required<Order>();
  isStaff = input<boolean>(false);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  itemsCount = computed(() => {
    return this.order().items.reduce((sum, item) => sum + item.quantity, 0);
  });

  avgItemPrice = computed(() => {
    const count = this.itemsCount();
    if (count === 0) return 0;
    return this.order().totalPrice / count;
  });

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'paid':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'refunded':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  }

  getStatusEmoji(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'paid':
        return '💳';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'refunded':
        return '↩️';
      default:
        return '📦';
    }
  }

  formatStatus(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'paid':
        return 'Paid';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  formatDate(value: number | string): string {
    const d = typeof value === 'number' ? new Date(value) : new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return d.toLocaleDateString('en-US', options);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
