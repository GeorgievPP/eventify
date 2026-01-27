import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { Event } from '../../../../../models/events';


@Component({
  selector: 'app-admin-events-table',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './admin-events-table.html',
  styleUrl: './admin-events-table.css',
})
export class AdminEventsTable {
  // ==========================================
  // INPUTS
  // ==========================================
  events = input.required<Event[]>();
  sortBy = input.required<'title' | 'date' | 'price' | 'tickets' | 'revenue'>();
  sortDirection = input.required<'asc' | 'desc'>();
  formatPrice = input.required<(value?: number) => string>();
  formatDateIso = input.required<(value?: string | null) => string>();
  formatEventDate = input.required<(value?: string) => string>();
  statusLabel = input.required<(event: Event) => string>();
  getEventRevenue = input.required<(eventId: string) => number>();
  getTicketsSold = input.required<(eventId: string) => number>();

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() softDelete = new EventEmitter<Event>();
  @Output() restore = new EventEmitter<Event>();
  @Output() hardDelete = new EventEmitter<Event>();
  @Output() sortChange = new EventEmitter<'title' | 'date' | 'price' | 'tickets' | 'revenue'>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onSoftDelete(event: Event): void {
    this.softDelete.emit(event);
  }

  onRestore(event: Event): void {
    this.restore.emit(event);
  }

  onHardDelete(event: Event): void {
    this.hardDelete.emit(event);
  }

  onSort(column: 'title' | 'date' | 'price' | 'tickets' | 'revenue'): void {
    this.sortChange.emit(column);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  getTicketPercentage(event: Event): number {
    if (event.totalTickets === 0) return 0;
    return (event.availableTickets / event.totalTickets) * 100;
  }
}
