import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { EventService } from '../../../core/services/events';
import { NotificationService } from '../../../core/services/ui';
import { CartService } from '../../../core/services/cart';

import { Event } from '../../../models/events';
import { SearchFilters } from './event-search.types';

import { EventItem } from '../components/event-item/event-item';
import { EventSearchFilters } from './components/event-search-filters/event-search-filters';

@Component({
  selector: 'app-event-search',
  imports: [EventItem, EventSearchFilters],
  templateUrl: './event-search.html',
  styleUrl: './event-search.css',
})
export class EventSearch implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private eventService = inject(EventService);
  private notifications = inject(NotificationService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  // ==========================================
  // STATE FROM SERVICES
  // ==========================================
  events = this.eventService.events;
  loading = this.eventService.isLoading;
  error = this.eventService.error;

  // ==========================================
  // COMPUTED PROPERTIES (Filter Options)
  // ==========================================

  globalMaxPrice = computed(() => {
    let max = 0;
    this.events().forEach((e) => {
      if (typeof e.price === 'number' && e.price > max) {
        max = e.price;
      }
    });
    return max;
  });

  sliderMax = computed(() => {
    const m = this.globalMaxPrice();
    return Math.ceil(m * 100) / 100;
  });

  genres = computed<string[]>(() => {
    const set = new Set<string>();
    this.events().forEach((e) => {
      if (e.genre && e.genre.trim()) {
        set.add(e.genre.trim());
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  countries = computed<string[]>(() => {
    const set = new Set<string>();
    this.events().forEach((e) => {
      if (e.country && e.country.trim()) {
        set.add(e.country.trim());
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  // ==========================================
  // LOCAL STATE (Search Filters)
  // ==========================================

  filters = signal<SearchFilters>({
    title: '',
    country: '',
    genres: [] as string[],
    maxPrice: null as number | null,
  });

  initialGenre = signal<string | null>(null);

  filteredEvents = computed<Event[]>(() => {
    const f = this.filters();
    const title = f.title.trim().toLowerCase();
    const country = f.country.trim().toLowerCase();
    const genres = new Set(f.genres.map((g) => g.toLowerCase()));
    const maxPrice = f.maxPrice;

    return this.events().filter((e) => {
      const eTitle = (e.title ?? '').toLowerCase();
      const eCountry = (e.country ?? '').toLowerCase();
      const eGenre = (e.genre ?? '').toLowerCase();

      const matchesTitle = !title || eTitle.startsWith(title);
      const matchesCountry = !country || eCountry.startsWith(country);
      const matchesGenres = genres.size === 0 || genres.has(eGenre);
      const matchesPrice =
        maxPrice == null || (typeof e.price === 'number' ? e.price <= maxPrice : true);

      return matchesTitle && matchesCountry && matchesGenres && matchesPrice;
    });
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================
  ngOnInit(): void {
    console.log('[EventSearch] ngOnInit - events:', this.events().length);

    const genreParam = this.route.snapshot.queryParams['genre'];
    if (genreParam) {
      this.initialGenre.set(genreParam);
      this.filters.set({
        ...this.filters(),
        genres: [genreParam],
      });
    }

    if (this.events().length === 0) {
      this.loadEvents();
    }
  }

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  onFiltersChange(filters: SearchFilters): void {
    this.filters.set(filters);
  }

  onResetFilters(): void {
    this.initialGenre.set(null);
    this.filters.set({
      title: '',
      country: '',
      genres: [],
      maxPrice: null,
    });
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
          console.log('[EventSearch] Events loaded successfully');
        },
        error: () => {
          const err = this.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to load events for search.');
          }
        },
      });
  }
}
