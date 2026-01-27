import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { EventApiService, EventService } from '../../../core/services/events';
import { NotificationService } from '../../../core/services/ui';
import { CartService } from '../../../core/services/cart';

import { EventHistoryEntry } from '../../../models/events';
import { DeleteMode } from './event-details.types';

import { EventComments } from './components/event-comments/event-comments';
import { EventDetailsHero } from './components/event-details-hero/event-details-hero';
import { EventRating } from './components/event-rating/event-rating';
import { EventHistory } from './components/event-history/event-history';
import { ConfirmDialog } from '../../../shared/ui/dialog/confirm-dialog/confirm-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-details',
  imports: [EventComments, EventDetailsHero, EventRating, EventHistory, ConfirmDialog],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private notifications = inject(NotificationService);
  private cartService = inject(CartService);
  private eventApi = inject(EventApiService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // AUTH STATE
  // ==========================================
  userId = this.authService.userId;
  isStaff = this.authService.isStaff;

  // ==========================================
  // EVENT DATA (from service)
  // ==========================================
  singleEvent = this.eventService.singleEvent;
  loading = this.eventService.isLoadingSingle;
  id: string | null = null;

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  isInCart = computed(() => {
    const event = this.singleEvent();
    return event ? this.cartService.isInCart(event._id) : false;
  });

  userRating = computed(() => {
    const event = this.singleEvent();
    const uid = this.userId();

    if (!event || !uid) return 0;

    return 0;
  });

  // ==========================================
  // CART ACTIONS
  // ==========================================

  toggleCart(): void {
    const event = this.singleEvent();
    if (!event) return;

    if (this.isInCart()) {
      this.cartService.remove(event._id);
      this.notifications.showSuccess('Event removed from cart.');
    } else {
      const success = this.cartService.add(event);
      if (success) {
        this.notifications.showSuccess('Event added to cart.');
      } else {
        const error = this.cartService.error();
        if (error) {
          this.notifications.showError(error);
        }
      }
    }
  }

  // ==========================================
  // DELETE CONFIRMATION STATE
  // ==========================================
  isConfirmOpen = signal(false);
  deleteTargetId = signal<string | null>(null);
  deleteMode = signal<DeleteMode | null>(null);

  openDeleteConfirm(id: string | null, mode: DeleteMode): void {
    if (!id) return;

    this.deleteTargetId.set(id);
    this.deleteMode.set(mode);
    this.isConfirmOpen.set(true);
  }

  cancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.deleteTargetId.set(null);
    this.deleteMode.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    const mode = this.deleteMode();
    if (!id || !mode) return;

    if (mode === 'soft') {
      this.eventService
        .delete(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.cancelDelete();
            this.notifications.showSuccess('Event deleted successfully.');
            this.reloadDetails();
          },
          error: () => {
            this.cancelDelete();
            const err = this.eventService.error();
            if (err) {
              this.notifications.showError(err);
            } else {
              this.notifications.showError('Failed to delete event');
            }
          },
        });
      return;
    }

    this.eventApi
      .hardDelete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancelDelete();
          this.notifications.showSuccess('Event permanently deleted.');
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          this.cancelDelete();
          this.notifications.showError('Failed to hard delete event');
          console.error('[EventDetails] Hard delete error:', err);
        },
      });
  }

  // ==========================================
  // RESTORE ACTION
  // ==========================================

  restoreEvent(): void {
    const event = this.singleEvent();
    if (!event?._id) return;

    const ok = confirm(`Restore "${event.title}"?`);
    if (!ok) return;

    this.eventApi
      .restoreEvent(event._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Event restored.');
          this.reloadDetails();
        },
        error: (err) => {
          this.notifications.showError('Failed to restore event.');
          console.error('[EventDetails] Restore error:', err);
        },
      });
  }

  // ==========================================
  // EVENT HISTORY (Admin)
  // ==========================================
  history = signal<EventHistoryEntry[]>([]);
  historyLoading = signal(false);

  private loadHistory(eventId: string): void {
    this.historyLoading.set(true);

    this.eventApi
      .getEventHistory(eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.history.set(entries);
          this.historyLoading.set(false);
        },
        error: (err) => {
          this.historyLoading.set(false);
          this.notifications.showError('Failed to load event history.');
          console.error('[EventDetails] History load error:', err);
        },
      });
  }

  // ==========================================
  // RATING
  // ==========================================
  ratingSubmitting = signal(false);

  onRate(value: number): void {
    if (!this.id) return;
    if (this.ratingSubmitting()) return;

    this.ratingSubmitting.set(true);

    this.eventService
      .rateEvent(this.id, value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ratingSubmitting.set(false);
          this.notifications.showSuccess('Thank you for rating this event.');
          this.reloadEventOnly();
        },
        error: () => {
          this.ratingSubmitting.set(false);
          const err = this.eventService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to rate event.');
          }
        },
      });
  }

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      this.notifications.showError('Invalid event ID');
      this.router.navigate(['/']);
      return;
    }

    this.reloadDetails();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private reloadEventOnly(): void {
    if (!this.id) return;

    this.eventService
      .loadSingleEvent(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          const err = this.eventService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to refresh event details.');
          }
        },
      });
  }

  private reloadDetails(): void {
    if (!this.id) return;

    this.eventService
      .loadSingleEvent(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.isStaff()) {
            this.loadHistory(this.id!);
          }
        },
        error: () => {
          const err = this.eventService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to load event details.');
          }
        },
      });
  }
}
