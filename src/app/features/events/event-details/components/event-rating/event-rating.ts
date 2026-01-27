import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Event } from '../../../../../models/events';

@Component({
  selector: 'app-event-rating',
  imports: [DecimalPipe],
  templateUrl: './event-rating.html',
  styleUrl: './event-rating.css',
})
export class EventRating {
  @Input() event: Event | null = null;
  @Input() userId: string | null = null;
  @Input() submitting = false;

  userRating = signal<number | null>(null);
  hoverRating = signal<number | null>(null);

  readonly stars = [1, 2, 3, 4, 5];

  display = computed(() => this.hoverRating() ?? this.userRating() ?? 0);

  @Output() rate = new EventEmitter<number>();

  onStarEnter(value: number): void {
    this.hoverRating.set(value);
  }

  onStarLeave(): void {
    this.hoverRating.set(null);
  }

  onRate(value: number): void {
    if (!this.userId) return;
    if (this.submitting) return;

    this.userRating.set(value);

    this.rate.emit(value);
  }
}
