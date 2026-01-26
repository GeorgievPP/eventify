import { computed, Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '../../constants';

import { CartItem } from '../../../models/cart';
import { Event } from '../../../models/events';

@Injectable({
  providedIn: 'root',
})
export class CartStoreService {
  // ==========================================
  // PRIVATE STATE
  // ==========================================
  private readonly CART_STORAGE_KEY = STORAGE_KEYS.CART;
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  // ==========================================
  // PUBLIC COMPUTED PROPERTIES
  // ==========================================
  readonly items = computed(() => this._items());
  readonly itemsCount = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));

  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + (item.event.price ?? 0) * item.quantity, 0),
  );

  readonly isEmpty = computed(() => this._items().length === 0);
  readonly hasItems = computed(() => this._items().length > 0);
  readonly uniqueEventsCount = computed(() => this._items().length);

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  addItem(event: Event): void {
    this._items.update((items) => {
      const existing = items.find((item) => item.event._id === event._id);

      if (existing) {
        console.log(`[CartStore] Increased quantity for event: ${event._id}`);

        return items.map((item) =>
          item.event._id === event._id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        const newItem: CartItem = {
          event,
          addedAt: Date.now(),
          quantity: 1,
        };
        console.log(`[CartStore] Added new item: ${event._id}`);
        return [newItem, ...items];
      }
    });

    this.saveToStorage(this._items());
  }

  increaseQuantity(eventId: string): void {
    this._items.update((items) =>
      items.map((item) =>
        item.event._id === eventId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
    this.saveToStorage(this._items());
    console.log(`[CartStore] Increased quantity for: ${eventId}`);
  }

  decreaseQuantity(eventId: string): void {
    const target = this._items().find((item) => item.event._id === eventId);
    if (!target) {
      console.warn(`[CartStore] Item not found: ${eventId}`);
      return;
    }

    if (target.quantity <= 1) {
      this.removeItem(eventId);
      return;
    }

    this._items.update((items) =>
      items.map((item) =>
        item.event._id === eventId ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    );

    this.saveToStorage(this._items());
    console.log(`[CartStore] Decreased quantity for: ${eventId}`);
  }

  setQuantity(eventId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(eventId);
      return;
    }

    this._items.update((items) =>
      items.map((item) => (item.event._id === eventId ? { ...item, quantity } : item)),
    );

    this.saveToStorage(this._items());
    console.log(`[CartStore] Set quantity for ${eventId}: ${quantity}`);
  }

  removeItem(eventId: string): void {
    this._items.update((items) => items.filter((i) => i.event._id !== eventId));
    this.saveToStorage(this._items());
    console.log(`[CartStore] Removed item: ${eventId}`);
  }

  clearCart(): void {
    this._items.set([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
    console.log('[CartStore] Cart cleared');
  }

  setItems(items: CartItem[]): void {
    this._items.set(items);
    this.saveToStorage(items);
    console.log(`[CartStore] Cart set: ${items.length} items`);
  }

  // ==========================================
  // PUBLIC QUERY METHODS
  // ==========================================

  isInCart(eventId: string): boolean {
    return this._items().some((item) => item.event._id === eventId);
  }

  getItem(eventId: string): CartItem | null {
    return this._items().find((item) => item.event._id === eventId) ?? null;
  }

  getQuantity(eventId: string): number {
    const item = this._items().find((item) => item.event._id === eventId);
    return item?.quantity ?? 0;
  }

  getItemsByDateAdded(descending: boolean = true): CartItem[] {
    return [...this._items()].sort((a, b) =>
      descending ? b.addedAt - a.addedAt : a.addedAt - b.addedAt,
    );
  }

  getItemsByPrice(descending: boolean = true): CartItem[] {
    return [...this._items()].sort((a, b) => {
      const priceA = (a.event.price ?? 0) * a.quantity;
      const priceB = (b.event.price ?? 0) * b.quantity;

      return descending ? priceB - priceA : priceA - priceB;
    });
  }

  getItemTotalPrice(eventId: string): number {
    const item = this._items().find((item) => item.event._id === eventId);
    if (!item) return 0;

    return (item.event.price ?? 0) * item.quantity;
  }

  getItemsByGenre(genre: string): CartItem[] {
    const lowerGenre = genre.toLowerCase();

    return this._items().filter((item) => item.event.genre.toLowerCase() === lowerGenre);
  }

  getItemsByCountry(country: string): CartItem[] {
    const lowerCountry = country.toLowerCase();

    return this._items().filter((item) => item.event.country.toLowerCase() === lowerCountry);
  }

  getAvailableItems(): CartItem[] {
    return this._items().filter((item) => item.event.availableTickets > 0);
  }

  getUnavailableItems(): CartItem[] {
    return this._items().filter((item) => item.event.availableTickets === 0);
  }

  areAllItemsAvailable(): boolean {
    return this._items().every((item) => item.event.availableTickets >= item.quantity);
  }

  getItemsExceedingAvailability(): CartItem[] {
    return this._items().filter((item) => item.quantity > item.event.availableTickets);
  }

  validateCart(): {
    valid: boolean;
    issues: { eventId: string; eventTitle: string; requested: number; available: number }[];
  } {
    const issues = this._items()
      .filter((item) => item.quantity > item.event.availableTickets)
      .map((item) => ({
        eventId: item.event._id,
        eventTitle: item.event.title,
        requested: item.quantity,
        available: item.event.availableTickets,
      }));

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // ==========================================
  // PRIVATE PERSISTENCE METHODS
  // ==========================================

  private loadFromStorage(): CartItem[] {
    const raw = localStorage.getItem(this.CART_STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as any[];

      const items = parsed.map((item) => ({
        ...item,
        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
      })) as CartItem[];

      console.log(`[CartStore] Loaded ${items.length} items from storage`);
      return items;
    } catch (error) {
      console.error('[CartStore] Failed to load from storage:', error);
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[CartStore] Failed to save to storage:', error);
    }
  }
}
