import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Event } from '../../../../models/events';

@Component({
  selector: 'app-event-item',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './event-item.html',
  styleUrl: './event-item.css',
})
export class EventItem {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  event = input.required<Event>();
  inCart = input<boolean>(false);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() toggleCart = new EventEmitter<Event>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  onToggleCart(): void {
    this.toggleCart.emit(this.event());
  }

  // ==========================================
  // COMPUTED PROPERTIES (Price)
  // ==========================================

  hasPreviousPrice = computed(() => {
    const previousPrice = this.event().previousPrice;
    return (
      previousPrice !== null && previousPrice !== undefined && previousPrice !== this.event().price
    );
  });

  isDown = computed(() => {
    if (!this.hasPreviousPrice()) return false;
    return this.event().price < (this.event().previousPrice ?? 0);
  });

  priceChangePercent = computed(() => {
    if (!this.hasPreviousPrice()) return 0;

    const prev = this.event().previousPrice as number;
    if (!prev) return 0;

    const current = this.event().price;
    return ((current - prev) / prev) * 100;
  });

  // ==========================================
  // COMPUTED PROPERTIES (Ticket Availability)
  // ==========================================

  isSoldOut = computed(() => {
    return this.event().availableTickets === 0;
  });

  isLowStock = computed(() => {
    if (this.isSoldOut()) return false;
    const event = this.event();
    const percentage = (event.availableTickets / event.totalTickets) * 100;
    return percentage < 20; // Less than 20% available
  });

  ticketStatusLabel = computed(() => {
    if (this.isSoldOut()) return 'SOLD OUT';
    if (this.isLowStock()) return `Only ${this.event().availableTickets} left`;
    return `${this.event().availableTickets.toLocaleString()} available`;
  });

  // ==========================================
  // COMPUTED PROPERTIES (Date/Time)
  // ==========================================

  formattedDate = computed(() => {
    const eventDate = this.event().eventDate;
    if (!eventDate) return '';

    const date = new Date(eventDate);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
  });

  formattedTime = computed(() => {
    return this.event().eventTime ?? '';
  });

  isUpcoming = computed(() => {
    const eventDate = this.event().eventDate;
    if (!eventDate) return true;
    return new Date(eventDate) > new Date();
  });
}
