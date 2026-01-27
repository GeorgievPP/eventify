import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Event } from '../../../models/events';

import { EventService } from '../../../core/services/events';
import { CartService } from '../../../core/services/cart';
import { NotificationService } from '../../../core/services/ui';
// Component Child's
import { EventItem } from '../components/event-item/event-item';
import { EventSkeletonGrid } from './components/event-skeleton-grid/event-skeleton-grid';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-board',
  imports: [RouterLink, EventItem, EventSkeletonGrid, Pagination],
  templateUrl: './event-board.html',
  styleUrl: './event-board.css',
})
export class EventBoard {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private eventService = inject(EventService);
  private cartService = inject(CartService);
  private notifications = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // STATE FROM SERVICES
  // ==========================================
  events = this.eventService.events;
  loading = this.eventService.isLoading;
  error = this.eventService.error;

  // ==========================================
  // LOCAL STATE (Pagination)
  // ==========================================
  readonly pageSize = 6;
  currentPage = signal(1);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  totalPages = computed(() => {
    const total = this.events().length;
    if (!total) return 1;
    return Math.ceil(total / this.pageSize);
  });

  pagedEvents = computed<Event[]>(() => {
    const all = this.events();
    if (!all.length) return [];

    const totalPages = this.totalPages();
    const current = Math.min(this.currentPage(), totalPages);

    const startIndex = (current - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return all.slice(startIndex, endIndex);
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================
  ngOnInit(): void {
    console.log('[EventBoard] ngOnInit - events:', this.events().length);

    if (this.events().length === 0) {
      this.loadEvents();
    }
  }

  // ==========================================
  // PAGINATION ACTIONS
  // ==========================================

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;

    this.currentPage.set(page);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // CART ACTIONS
  // ==========================================

  isInCart(eventId: string): boolean {
    return this.cartService.isInCart(eventId);
  }

  toggleCart(event: Event): void {
    if (this.isInCart(event._id)) {
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
  // DATA LOADING
  // ==========================================

  private loadEvents(): void {
    this.eventService
      .loadAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('[EventBoard] Events loaded successfully');
        },
        error: () => {
          const err = this.error();
          if (err) {
            this.notifications.showError(err);
          }
        },
      });
  }
}
