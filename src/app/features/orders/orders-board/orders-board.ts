import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/services/auth';
import { OrderService } from '../../../core/services/orders';
import { NotificationService } from '../../../core/services/ui';
import { ExportExcelService } from '../../../core/services/export';

import { Order, OrderStatus } from '../../../models/orders';
import { DataTableColumn } from '../../../models/shared';

// Child components
import { OrdersFilters } from './components/orders-filters/orders-filters';
import { OrdersTable } from './components/orders-table/orders-table';
import { AckConfirmDialog } from '../../../shared/ui/dialog/ack-confirm-dialog/ack-confirm-dialog';

import { DateRangeFilter, OrderRow } from './orders-board.types';

@Component({
  selector: 'app-orders-board',
  imports: [RouterLink, DecimalPipe, OrdersFilters, OrdersTable, AckConfirmDialog],
  templateUrl: './orders-board.html',
  styleUrl: './orders-board.css',
})
export class Orders implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private notifications = inject(NotificationService);
  private exportExcel = inject(ExportExcelService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  userId = this.authService.userId;
  isStaff = this.authService.isStaff;
  isAdmin = this.authService.isAdmin;

  // ==========================================
  // ORDERS DATA (from service)
  // ==========================================
  private allOrders = this.orderService.orders;

  private userOrders = computed(() => {
    const uid = this.userId();
    if (!uid) return [];

    return this.orderService.ordersForUser(uid)();
  });

  effectiveOrders = computed<Order[]>(() => {
    return this.isStaff() ? this.allOrders() : this.userOrders();
  });

  // ==========================================
  // FILTER STATE
  // ==========================================
  emailFilter = signal<string>('');
  statusFilter = signal<'all' | OrderStatus>('all');
  dateRangeFilter = signal<DateRangeFilter>('all');

  readonly statusOptions: { value: 'all' | OrderStatus; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  readonly dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
    { value: 'all', label: 'All time' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'thisMonth', label: 'This month' },
  ];

  // ==========================================
  // COMPUTED PROPERTIES (Filtered Data)
  // ==========================================

  filteredOrders = computed<Order[]>(() => {
    const orders = this.effectiveOrders();
    const status = this.statusFilter();
    const emailTerm = this.emailFilter().trim().toLowerCase();
    const dateRange = this.dateRangeFilter();

    return orders.filter((o) => {
      const matchesStatus = status === 'all' || o.status === status;

      const email = (o.userEmail || '').toLowerCase();
      const matchesEmail = !emailTerm || email.includes(emailTerm);

      let matchesDate = true;
      if (dateRange !== 'all') {
        const now = Date.now();
        const orderDate = o.createdAt;

        switch (dateRange) {
          case '7d':
            matchesDate = now - orderDate <= 7 * 24 * 60 * 60 * 1000;
            break;
          case '30d':
            matchesDate = now - orderDate <= 30 * 24 * 60 * 60 * 1000;
            break;
          case 'thisMonth':
            const nowDate = new Date();
            const orderDateObj = new Date(orderDate);
            matchesDate =
              nowDate.getMonth() === orderDateObj.getMonth() &&
              nowDate.getFullYear() === orderDateObj.getFullYear();
            break;
        }
      }

      return matchesStatus && matchesEmail && matchesDate;
    });
  });

  baseSortedOrders = computed<Order[]>(() =>
    [...this.filteredOrders()].sort((a, b) => b.createdAt - a.createdAt),
  );

  tableRows = computed<OrderRow[]>(() =>
    this.baseSortedOrders().map((o) => ({
      ...o,
      itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
  );

  effectiveCount = computed(() => this.effectiveOrders().length);

  resultsCount = computed(() => this.tableRows().length);

  orderStats = computed(() => {
    const orders = this.filteredOrders();

    const byStatus = {
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      refunded: orders.filter((o) => o.status === 'refunded').length,
      paid: orders.filter((o) => o.status === 'paid').length,
    };

    const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

    return {
      total: orders.length,
      byStatus,
      revenue,
      avgOrderValue,
    };
  });

  // ==========================================
  // TABLE CONFIGURATION
  // ==========================================

  readonly orderColumns: DataTableColumn<OrderRow>[] = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
    },
    {
      key: 'userEmail',
      label: 'User Email',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Date',
      align: 'left',
      sortable: true,
      format: (o) => this.formatDate(o.createdAt),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      sortable: true,
      format: (o) => this.formatStatus(o.status),
    },
    {
      key: 'itemsCount',
      label: 'Items',
      align: 'center',
      sortable: true,
      format: (o) => o.itemsCount.toString(),
    },
    {
      key: 'totalPrice',
      label: 'Total',
      align: 'right',
      sortable: true,
      format: (o) =>
        `${o.totalPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} €`,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      isActions: true,
    },
  ];

  orderRowLink = (row: OrderRow) => `/orders/${row.id}`;

  // ==========================================
  // UI STATE
  // ==========================================
  isMobile = signal(window.matchMedia('(max-width: 640px)').matches);

  clearHistoryOpen = signal(false);

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    console.log('[Orders] ngOnInit - Loading orders');

    const statusParam = this.route.snapshot.queryParamMap.get('status') as OrderStatus | null;

    if (statusParam && this.statusOptions.some((opt) => opt.value === statusParam)) {
      this.statusFilter.set(statusParam);
    }

    this.orderService.loadOrders().subscribe({
      next: () => {
        console.log('[Orders] Orders loaded successfully, count:', this.effectiveOrders().length);
      },
      error: (err) => {
        console.error('[Orders] Failed to load orders:', err);
      },
    });
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  private formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return d.toLocaleDateString('en-US', options);
  }

  private formatStatus(status: OrderStatus): string {
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

  private buildExportRows(orders: Order[]): any[] {
    return orders.map((o) => ({
      'Order ID': o.id,
      'User ID': o.userId,
      'User Email': o.userEmail,
      'Created At': new Date(o.createdAt).toLocaleString(),
      Status: this.formatStatus(o.status),
      'Items Count': o.items.reduce((sum, item) => sum + item.quantity, 0),
      'Total Price (€)': o.totalPrice.toFixed(2),
      'Items Details': o.items
        .map(
          (item) =>
            `${item.title} x${item.quantity} (@${item.unitPrice.toFixed(2)}€) = ${item.lineTotal.toFixed(2)}€`,
        )
        .join(' | '),
    }));
  }

  // ==========================================
  // EXPORT ACTIONS
  // ==========================================

  exportOrders(): void {
    const orders = this.baseSortedOrders();
    if (!orders.length) {
      this.notifications.showError('There are no orders to export.');
      return;
    }

    const rows = this.buildExportRows(orders);
    const fileName = this.isStaff() ? 'all-orders' : 'my-orders';

    this.exportExcel.exportToExcel(rows, fileName);
    this.notifications.showSuccess('Orders exported to Excel.');
  }

  exportOrdersLast30Days(): void {
    const now = Date.now();
    const last30 = this.effectiveOrders().filter(
      (o) => now - o.createdAt <= 30 * 24 * 60 * 60 * 1000,
    );

    if (!last30.length) {
      this.notifications.showError('There are no orders in the last 30 days.');
      return;
    }

    const rows = this.buildExportRows(last30);
    const fileName = this.isStaff() ? 'all-orders-last-30-days' : 'my-orders-last-30-days';

    this.exportExcel.exportToExcel(rows, fileName);
    this.notifications.showSuccess('Last 30 days orders exported to Excel.');
  }

  exportOrdersLast7Days(): void {
    const now = Date.now();
    const last7 = this.effectiveOrders().filter(
      (o) => now - o.createdAt <= 7 * 24 * 60 * 60 * 1000,
    );

    if (!last7.length) {
      this.notifications.showError('There are no orders in the last 7 days.');
      return;
    }

    const rows = this.buildExportRows(last7);
    const fileName = this.isStaff() ? 'all-orders-last-7-days' : 'my-orders-last-7-days';

    this.exportExcel.exportToExcel(rows, fileName);
    this.notifications.showSuccess('Last 7 days orders exported to Excel.');
  }

  // ==========================================
  // CLEAR HISTORY ACTIONS (Users only)
  // ==========================================

  openClearHistory(): void {
    this.clearHistoryOpen.set(true);
  }

  closeClearHistory(): void {
    this.clearHistoryOpen.set(false);
  }

  confirmClearHistory(): void {
    const uid = this.userId();
    if (!uid) return;

    this.orderService.clearAllForUser(uid);
    this.notifications.showSuccess('Orders history cleared.');
    this.clearHistoryOpen.set(false);
  }
}
