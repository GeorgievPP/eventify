import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/services/auth';
import { EventApiService } from '../../../core/services/events';
import { OrderService } from '../../../core/services/orders';
import { NotificationService } from '../../../core/services/ui';
import { ExportExcelService } from '../../../core/services/export';

import { Event } from '../../../models/events';
import { EventFilter } from './admin-events.types';

import { AdminEventsFilters } from './components/admin-events-filters/admin-events-filters';
import { AdminEventsTable } from './components/admin-events-table/admin-events-table';


@Component({
  selector: 'app-admin-events',
  imports: [RouterLink, AdminEventsFilters, AdminEventsTable],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.css',
})
export class AdminEvents implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private auth = inject(AuthService);
  private api = inject(EventApiService);
  private orderService = inject(OrderService);
  private notifications = inject(NotificationService);
  private excelService = inject(ExportExcelService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  isStaff = this.auth.isStaff;

  // ==========================================
  // DATA STATE
  // ==========================================
  events = signal<Event[]>([]);
  loading = signal(false);
  orders = this.orderService.orders;

  // ==========================================
  // FILTER STATE
  // ==========================================
  filter = signal<EventFilter>('all');
  searchTerm = signal('');
  sortBy = signal<'title' | 'date' | 'price' | 'tickets' | 'revenue'>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // ==========================================
  // COMPUTED PROPERTIES (Stats)
  // ==========================================
  totalEvents = computed(() => this.events().length);
  activeEvents = computed(() => this.events().filter((e) => !e.isDeleted).length);
  deletedEvents = computed(() => this.events().filter((e) => e.isDeleted).length);

  soldOutEvents = computed(() =>
    this.events().filter((e) => !e.isDeleted && e.availableTickets === 0).length,
  );

  upcomingEvents = computed(() => {
    const now = new Date();
    return this.events().filter((e) => {
      if (e.isDeleted) return false;
      if (!e.eventDate) return true;
      return new Date(e.eventDate) > now;
    }).length;
  });

  eventRevenue = computed(() => {
    const revenueMap = new Map<string, number>();

    for (const order of this.orders()) {
      for (const item of order.items) {
        const revenue = item.lineTotal ?? item.unitPrice * (item.quantity ?? 1);
        revenueMap.set(item.eventId, (revenueMap.get(item.eventId) ?? 0) + revenue);
      }
    }

    return revenueMap;
  });

  ticketsSold = computed(() => {
    const soldMap = new Map<string, number>();

    for (const order of this.orders()) {
      for (const item of order.items) {
        const qty = item.quantity ?? 1;
        soldMap.set(item.eventId, (soldMap.get(item.eventId) ?? 0) + qty);
      }
    }

    return soldMap;
  });

  filteredEvents = computed(() => {
    const list = this.events();
    const filter = this.filter();
    const term = this.searchTerm().trim().toLowerCase();
    const sortBy = this.sortBy();
    const sortDir = this.sortDirection();

    let filtered = list.filter((e) => {
      const isDeleted = !!e.isDeleted;
      if (filter === 'active' && isDeleted) return false;
      if (filter === 'deleted' && !isDeleted) return false;

      if (!term) return true;

      const title = e.title.toLowerCase();
      const genre = e.genre.toLowerCase();
      const ownerEmail = e.owner?.email?.toLowerCase() ?? '';

      return title.includes(term) || genre.includes(term) || ownerEmail.includes(term);
    });

    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'date':
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          compareValue = dateA - dateB;
          break;
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'tickets':
          compareValue = a.availableTickets - b.availableTickets;
          break;
        case 'revenue':
          const revA = this.eventRevenue().get(a._id) ?? 0;
          const revB = this.eventRevenue().get(b._id) ?? 0;
          compareValue = revA - revB;
          break;
      }

      return sortDir === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    if (!this.isStaff()) return;

    this.loadEvents();
    this.orderService.loadIfNeeded();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private loadEvents(): void {
    this.loading.set(true);

    this.api
      .getAllEventsAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.events.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AdminEvents] Error loading events', err);
          this.loading.set(false);
          this.notifications.showError('Failed to load events for admin.');
        },
      });
  }

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  setFilter(f: EventFilter): void {
    this.filter.set(f);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  setSortBy(column: 'title' | 'date' | 'price' | 'tickets' | 'revenue'): void {
    if (this.sortBy() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('desc');
    }
  }

  // ==========================================
  // EXPORT
  // ==========================================

  exportToExcel(): void {
    const events = this.filteredEvents();
    if (events.length === 0) {
      this.notifications.showError('No events to export.');
      return;
    }

    const excelData = events.map((e) => ({
      Title: e.title,
      'Event Date': this.formatEventDate(e.eventDate),
      'Event Time': e.eventTime || '-',
      Venue: e.venue || '-',
      Location: e.location || '-',
      Genre: e.genre,
      'Price (€)': e.price,
      'Available Tickets': e.availableTickets,
      'Total Tickets': e.totalTickets,
      'Tickets Sold': this.getTicketsSold(e._id),
      'Revenue (€)': this.getEventRevenue(e._id),
      'Capacity %': ((e.availableTickets / e.totalTickets) * 100).toFixed(1) + '%',
      Status: this.eventStatusLabel(e),
      'Owner Email': e.owner?.email || '-',
      'Created Date': this.formatDateIso(e.createdAtIso || null),
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    this.excelService.exportToExcel(excelData, `eventify-events-${timestamp}`);
    this.notifications.showSuccess(`Exported ${events.length} events to Excel.`);
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================

  softDelete(event: Event): void {
    if (!event._id) return;
    const ok = confirm(`Soft delete "${event.title}"?`);
    if (!ok) return;

    this.loading.set(true);

    this.api
      .deleteEvent(event._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Event soft-deleted.');
          this.loadEvents();
        },
        error: (err) => {
          console.error('[AdminEvents] Error soft-deleting event', err);
          this.loading.set(false);
          this.notifications.showError('Failed to delete event.');
        },
      });
  }

  restore(event: Event): void {
    if (!event._id) return;
    const ok = confirm(`Restore "${event.title}"?`);
    if (!ok) return;

    this.loading.set(true);

    this.api
      .restoreEvent(event._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Event restored.');
          this.loadEvents();
        },
        error: (err) => {
          console.error('[AdminEvents] Error restoring event', err);
          this.loading.set(false);
          this.notifications.showError('Failed to restore event.');
        },
      });
  }

  hardDelete(event: Event): void {
    if (!event._id) return;
    const ok = confirm(`Permanently delete "${event.title}"?\nThis cannot be undone.`);
    if (!ok) return;

    this.loading.set(true);

    this.api
      .hardDelete(event._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Event permanently deleted.');
          this.loadEvents();
        },
        error: (err) => {
          console.error('[AdminEvents] Error hard-deleting event', err);
          this.loading.set(false);
          this.notifications.showError('Failed to hard delete event.');
        },
      });
  }

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  formatDateIso(value?: string | null): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  }

  formatEventDate(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  }

  formatPrice(value?: number): string {
    if (typeof value !== 'number') return '-';
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  eventStatusLabel(event: Event): string {
    return event.isDeleted ? 'Deleted' : 'Active';
  }

  getEventRevenue(eventId: string): number {
    return this.eventRevenue().get(eventId) ?? 0;
  }

  getTicketsSold(eventId: string): number {
    return this.ticketsSold().get(eventId) ?? 0;
  }
}