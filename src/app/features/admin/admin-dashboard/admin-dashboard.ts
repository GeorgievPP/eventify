import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/services/auth';
import { OrderService } from '../../../core/services/orders';
import { UserApiService } from '../../../core/services/users';
import { EventService } from '../../../core/services/events';
import { NotificationService } from '../../../core/services/ui';

import { AdminUser } from '../../../models/users';
import { Order, OrderStatus } from '../../../models/orders';

import { DashboardPeriodType, TopEvent } from './admin-dashboard.types';

import { DashboardPeriod } from './components/dashboard-period/dashboard-period';
import { DashboardKpis } from './components/dashboard-kpis/dashboard-kpis';
import { DashboardRecentOrders } from './components/dashboard-recent-orders/dashboard-recent-orders';
import { DashboardTopEvents } from './components/dashboard-top-events/dashboard-top-events';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    DecimalPipe,
    DashboardPeriod,
    DashboardKpis,
    DashboardRecentOrders,
    DashboardTopEvents,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private userApi = inject(UserApiService);
  private eventService = inject(EventService);
  private notifications = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  isAdmin = this.authService.isAdmin;
  isStaff = this.authService.isStaff;

  // ==========================================
  // DATA STATE
  // ==========================================
  users = signal<AdminUser[]>([]);
  usersLoading = signal(false);
  events = this.eventService.events;
  eventsLoading = signal(false);
  orders = this.orderService.orders;
  period = signal<DashboardPeriodType>('all');

  // ==========================================
  // COMPUTED PROPERTIES (Users)
  // ==========================================
  totalUsers = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter((u) => !u.isDeleted).length);
  deletedUsers = computed(() => this.users().filter((u) => u.isDeleted).length);

  // ==========================================
  // COMPUTED PROPERTIES (Events)
  // ==========================================
  totalEvents = computed(() => this.events().length);
  activeEvents = computed(() => this.events().filter((e) => !e.isDeleted).length);

  soldOutEvents = computed(
    () => this.events().filter((e) => !e.isDeleted && e.availableTickets === 0).length,
  );

  upcomingEvents = computed(() => {
    const now = new Date();
    return this.events().filter((e) => {
      if (e.isDeleted) return false;
      if (!e.eventDate) return true;
      return new Date(e.eventDate) > now;
    }).length;
  });

  avgTicketPrice = computed(() => {
    const active = this.events().filter((e) => !e.isDeleted);
    if (active.length === 0) return 0;
    return active.reduce((sum, e) => sum + e.price, 0) / active.length;
  });

  lowStockEvents = computed(() =>
    this.events()
      .filter((e) => {
        if (e.isDeleted) return false;
        if (e.availableTickets === 0) return false;
        const percentage = (e.availableTickets / e.totalTickets) * 100;
        return percentage < 20;
      })
      .sort((a, b) => {
        const aPercentage = (a.availableTickets / a.totalTickets) * 100;
        const bPercentage = (b.availableTickets / b.totalTickets) * 100;
        return aPercentage - bPercentage;
      })
      .slice(0, 5),
  );

  totalTicketsAvailable = computed(() =>
    this.events()
      .filter((e) => !e.isDeleted)
      .reduce((sum, e) => sum + e.availableTickets, 0),
  );

  totalTicketsCapacity = computed(() =>
    this.events()
      .filter((e) => !e.isDeleted)
      .reduce((sum, e) => sum + e.totalTickets, 0),
  );

  ticketsSoldPercentage = computed(() => {
    const capacity = this.totalTicketsCapacity();
    if (capacity === 0) return 0;
    const sold = capacity - this.totalTicketsAvailable();
    return (sold / capacity) * 100;
  });

  // ==========================================
  // COMPUTED PROPERTIES (Orders - Filtered)
  // ==========================================

  filteredOrders = computed<Order[]>(() => {
    const list = this.orders();
    const period = this.period();
    if (period === 'all') return list;

    const now = Date.now();
    const days = period === '7d' ? 7 : 30;
    const ms = days * 24 * 60 * 60 * 1000;

    return list.filter((o) => now - o.createdAt <= ms);
  });

  totalOrders = computed(() => this.filteredOrders().length);

  totalRevenue = computed(() => this.filteredOrders().reduce((sum, o) => sum + o.totalPrice, 0));

  averageOrderValue = computed(() => {
    const total = this.totalOrders();
    if (!total) return 0;
    return this.totalRevenue() / total;
  });

  statusStats = computed(() => {
    const map = new Map<OrderStatus, number>();

    for (const o of this.filteredOrders()) {
      const key = o.status;
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  });

  conversionRate = computed(() => {
    const total = this.totalOrders();
    if (total === 0) return 0;
    const completed = this.statusStats().find((s) => s.status === 'completed');
    return ((completed?.count ?? 0) / total) * 100;
  });

  recentOrders = computed<Order[]>(() =>
    [...this.filteredOrders()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
  );

  topEvents = computed<TopEvent[]>(() => {
    const map = new Map<string, TopEvent>();

    for (const order of this.filteredOrders()) {
      for (const item of order.items) {
        const key = item.eventId;
        const existing = map.get(key);

        const quantity = item.quantity ?? 1;
        const revenue = item.lineTotal ?? item.unitPrice * quantity;

        if (!existing) {
          map.set(key, {
            eventId: item.eventId,
            title: item.title,
            totalQuantity: quantity,
            totalRevenue: revenue,
          });
        } else {
          existing.totalQuantity += quantity;
          existing.totalRevenue += revenue;
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  });

  periodLabel = computed(() => {
    const p = this.period();
    if (p === '7d') return 'Last 7 days';
    if (p === '30d') return 'Last 30 days';
    return 'All time';
  });

  // ==========================================
  // PERIOD FILTER
  // ==========================================

  setPeriod(p: DashboardPeriodType): void {
    if (p !== this.period()) this.period.set(p);
  }

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    if (!this.isStaff()) return;

    this.loadUsers();
    this.loadEvents();
    this.orderService.loadIfNeeded();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private loadUsers(): void {
    this.usersLoading.set(true);

    this.userApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.usersLoading.set(false);
        },
        error: (err) => {
          console.error('[AdminDashboard] Error loading users', err);
          this.usersLoading.set(false);
          this.notifications.showError('Failed to load users for dashboard.');
        },
      });
  }

  private loadEvents(): void {
    this.eventsLoading.set(true);

    this.eventService
      .loadAllAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eventsLoading.set(false);
        },
        error: (err) => {
          console.error('[AdminDashboard] Error loading events', err);
          this.eventsLoading.set(false);
          this.notifications.showError('Failed to load events for dashboard.');
        },
      });
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleString();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
