import { Component, computed, EventEmitter, input, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { Event } from '../../../../../models/events';
import { DeleteMode } from '../../event-details.types';

@Component({
  selector: 'app-event-details-hero',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './event-details-hero.html',
  styleUrl: './event-details-hero.css',
})
export class EventDetailsHero {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  loading = input<boolean>(false);
  event = input<Event | null>(null);
  inCart = input<boolean>(false);
  isStaff = input<boolean>(false);
  userId = input<string | null>(null);
  userRating = input<number>(0);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() toggleCart = new EventEmitter<void>();
  @Output() openDelete = new EventEmitter<{ id: string; mode: DeleteMode }>();
  @Output() restore = new EventEmitter<void>();
  @Output() rate = new EventEmitter<number>();

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  priceInfo = computed(() => {
    const e = this.event();
    if (!e) return null;

    const prev = e.previousPrice ?? null;
    const curr = e.price;

    if (prev == null || prev === curr) {
      return {
        prev: null,
        curr,
        diff: 0,
        pct: 0,
        isDown: false,
        isUp: false,
      };
    }

    const diff = curr - prev;
    const pct = prev !== 0 ? Math.round((Math.abs(diff) / prev) * 100) : 0;

    return {
      prev,
      curr,
      diff,
      pct,
      isDown: diff < 0, 
      isUp: diff > 0,
    };
  });

  // ==========================================
  // HELPERS
  // ==========================================

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onOpenDelete(mode: DeleteMode): void {
    const e = this.event();
    if (!e) return;

    this.openDelete.emit({ id: e._id, mode });
  }

  onRate(value: number): void {
    this.rate.emit(value);
  }
}
