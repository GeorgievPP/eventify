import { Component, computed, input, signal } from '@angular/core';

import { OrderHistoryEntry, OrderStatus } from '../../../../../models/orders';

import { HistoryItemsDiff } from '../../order-details.types';

@Component({
  selector: 'app-order-history',
  imports: [],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  history = input.required<OrderHistoryEntry[]>();
  loading = input(false);

  // ==========================================
  // LOCAL UI STATE
  // ==========================================
  sortOrder = signal<'asc' | 'desc'>('desc');
  expanded = signal<Record<string, boolean>>({});

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  sortedHistory = computed(() => {
    const arr = [...this.history()];
    return arr.sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return this.sortOrder() === 'desc' ? bt - at : at - bt;
    });
  });

  // ==========================================
  // UI ACTIONS
  // ==========================================

  toggleSort(): void {
    this.sortOrder.update((c) => (c === 'desc' ? 'asc' : 'desc'));
  }

  toggleDetails(id: string): void {
    this.expanded.update((m) => ({ ...m, [id]: !m[id] }));
  }

  isExpanded(id: string): boolean {
    return !!this.expanded()[id];
  }

  hasDetails(entry: OrderHistoryEntry): boolean {
    return !!(entry.before?.items || entry.after?.items || this.isTotalPriceChanged(entry));
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  getActionEmoji(action: string): string {
    const lower = action.toLowerCase();
    if (lower.includes('created')) return '🎉';
    if (lower.includes('status')) return '🔄';
    if (lower.includes('items')) return '📦';
    if (lower.includes('cancelled')) return '❌';
    if (lower.includes('refund')) return '↩️';
    return '📝';
  }

  getStatusColorClass(status: OrderStatus | null | undefined): string {
    if (!status) return 'bg-gray-500/10 text-gray-600 border-gray-500/30';

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

  formatStatus(status: OrderStatus | null | undefined): string {
    if (!status) return '-';
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

  formatCurrency(value: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ==========================================
  // ITEMS DIFF CALCULATION
  // ==========================================

  compareHistoryItems(entry: OrderHistoryEntry): HistoryItemsDiff | null {
    const beforeItems = entry.before?.items;
    const afterItems = entry.after?.items;

    console.log('[History Debug]', {
      action: entry.action,
      beforeItems,
      afterItems,
    });

    if (!Array.isArray(beforeItems) || !Array.isArray(afterItems)) return null;

    const beforeMap = new Map(beforeItems.map((it: any) => [it.eventId || it.title, it]));
    const afterMap = new Map(afterItems.map((it: any) => [it.eventId || it.title, it]));

    const added: HistoryItemsDiff['added'] = [];
    const removed: HistoryItemsDiff['removed'] = [];
    const changed: HistoryItemsDiff['changed'] = [];

    for (const [id, item] of afterMap) {
      if (!beforeMap.has(id)) {
        added.push({
          postId: item.eventId || item.title,
          title: item.title,
          quantity: item.quantity,
        });
      }
    }

    for (const [id, item] of beforeMap) {
      if (!afterMap.has(id)) {
        removed.push({
          postId: item.eventId || item.title,
          title: item.title,
          quantity: item.quantity,
        });
      }
    }

    for (const [id, afterItem] of afterMap) {
      const beforeItem = beforeMap.get(id);
      if (!beforeItem) continue;
      if (beforeItem.quantity !== afterItem.quantity) {
        changed.push({
          title: afterItem.title,
          before: beforeItem.quantity,
          after: afterItem.quantity,
        });
      }
    }

    return { added, removed, changed };
  }

  // ==========================================
  // TOTAL PRICE CALCULATION
  // ==========================================

  calcTotalFromSnapshot(snapshot: any): number | null {
    if (!snapshot || !Array.isArray(snapshot.items)) return null;
    return snapshot.items.reduce((sum: number, it: any) => {
      const qty = it.quantity ?? 0;
      const price = it.unitPrice ?? 0;
      return sum + qty * price;
    }, 0);
  }

  isTotalPriceChanged(entry: OrderHistoryEntry): boolean {
    const before = this.calcTotalFromSnapshot(entry.before);
    const after = this.calcTotalFromSnapshot(entry.after);
    return before !== null && after !== null && before !== after;
  }
}
