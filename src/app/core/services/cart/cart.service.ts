import { computed, inject, Injectable, signal } from '@angular/core';

import { CartStoreService } from './cart-store.service';

import { Event } from '../../../models/events';
import { CartItem } from '../../../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private readonly store = inject(CartStoreService);

  // ==========================================
  // ERROR & SUCCESS STATES
  // ==========================================
  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  private readonly _warning = signal<string | null>(null);
  readonly warning = computed(() => this._warning());

  // ==========================================
  // EXPOSE STORE PROPERTIES
  // ==========================================
  readonly items = this.store.items;
  readonly itemsCount = this.store.itemsCount;
  readonly totalPrice = this.store.totalPrice;
  readonly isEmpty = this.store.isEmpty;
  readonly hasItems = this.store.hasItems;
  readonly uniqueEventsCount = this.store.uniqueEventsCount;

  // ==========================================
  // ADD TO CART (with validation)
  // ==========================================

  add(event: Event): boolean {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    if (event.isDeleted) {
      this._error.set('Cannot add deleted event to cart.');
      console.error('[CartService] Cannot add deleted event:', event._id);
      return false;
    }

    const currentQuantity = this.store.getQuantity(event._id);
    const requestedQuantity = currentQuantity + 1;

    if (requestedQuantity > event.availableTickets) {
      this._error.set(`Cannot add more tickets. Only ${event.availableTickets} available.`);
      console.error(
        '[CartService] Not enough tickets:',
        `Requested: ${requestedQuantity}, Available: ${event.availableTickets}`,
      );
      return false;
    }

    this.store.addItem(event);
    this._lastOperationSuccess.set(true);
    console.log(`[CartService] Added event to cart: ${event.title}`);

    if (requestedQuantity === event.availableTickets) {
      this._warning.set('You have added all available tickets for this event.');
    }

    return true;
  }

  // ==========================================
  // QUANTITY OPERATIONS (with validation)
  // ==========================================

  increase(eventId: string): boolean {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    const item = this.store.getItem(eventId);
    if (!item) {
      this._error.set('Item not found in cart.');
      return false;
    }

    const requestedQuantity = item.quantity + 1;

    if (requestedQuantity > item.event.availableTickets) {
      this._error.set(`Cannot add more tickets. Only ${item.event.availableTickets} available.`);
      console.error(
        '[CartService] Cannot increase:',
        `Requested: ${requestedQuantity}, Available: ${item.event.availableTickets}`,
      );
      return false;
    }

    this.store.increaseQuantity(eventId);
    this._lastOperationSuccess.set(true);

    if (requestedQuantity === item.event.availableTickets) {
      this._warning.set('You have added all available tickets for this event.');
    }

    return true;
  }

  decrease(eventId: string): void {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    this.store.decreaseQuantity(eventId);
    this._lastOperationSuccess.set(true);
    console.log(`[CartService] Decreased quantity for: ${eventId}`);
  }

  setQuantity(eventId: string, quantity: number): boolean {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    if (quantity < 1) {
      this.remove(eventId);
      return true;
    }

    const item = this.store.getItem(eventId);
    if (!item) {
      this._error.set('Item not found in cart.');
      return false;
    }

    if (quantity > item.event.availableTickets) {
      this._error.set(
        `Cannot add ${quantity} tickets. Only ${item.event.availableTickets} available.`,
      );
      console.error(
        '[CartService] Invalid quantity:',
        `Requested: ${quantity}, Available: ${item.event.availableTickets}`,
      );
      return false;
    }

    this.store.setQuantity(eventId, quantity);
    this._lastOperationSuccess.set(true);

    if (quantity === item.event.availableTickets) {
      this._warning.set('You have added all available tickets for this event.');
    }

    return true;
  }

  // ==========================================
  // REMOVE OPERATIONS
  // ==========================================

  remove(eventId: string): void {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    this.store.removeItem(eventId);
    this._lastOperationSuccess.set(true);
    console.log(`[CartService] Removed event from cart: ${eventId}`);
  }

  clear(): void {
    this._error.set(null);
    this._warning.set(null);
    this._lastOperationSuccess.set(false);

    this.store.clearCart();
    this._lastOperationSuccess.set(true);
    console.log('[CartService] Cart cleared');
  }

  // ==========================================
  // VALIDATION & AVAILABILITY
  // ==========================================

  validateCart(): {
    valid: boolean;
    issues: { eventId: string; eventTitle: string; requested: number; available: number }[];
  } {
    return this.store.validateCart();
  }

  areAllItemsAvailable(): boolean {
    return this.store.areAllItemsAvailable();
  }

  getItemsExceedingAvailability(): CartItem[] {
    return this.store.getItemsExceedingAvailability();
  }

  fixCartAvailability(): number {
    const issues = this.store.getItemsExceedingAvailability();

    issues.forEach((item) => {
      if (item.event.availableTickets === 0) {
        this.store.removeItem(item.event._id);
        console.log(`[CartService] Removed sold-out event: ${item.event.title}`);
      } else {
        this.store.setQuantity(item.event._id, item.event.availableTickets);
        console.log(
          `[CartService] Adjusted quantity for ${item.event.title}: ${item.quantity} → ${item.event.availableTickets}`,
        );
      }
    });

    if (issues.length > 0) {
      this._warning.set(`Cart adjusted: ${issues.length} item(s) had availability issues.`);
    }

    return issues.length;
  }

  removeUnavailableItems(): number {
    const unavailable = this.store.getUnavailableItems();

    unavailable.forEach((item) => {
      this.store.removeItem(item.event._id);
      console.log(`[CartService] Removed unavailable event: ${item.event.title}`);
    });

    if (unavailable.length > 0) {
      this._warning.set(`Removed ${unavailable.length} unavailable item(s) from cart.`);
    }

    return unavailable.length;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  clearError(): void {
    this._error.set(null);
  }

  clearWarning(): void {
    this._warning.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  // ==========================================
  // STORE QUERY HELPERS (Delegation)
  // ==========================================

  isInCart(eventId: string): boolean {
    return this.store.isInCart(eventId);
  }

  getItem(eventId: string): CartItem | null {
    return this.store.getItem(eventId);
  }

  getQuantity(eventId: string): number {
    return this.store.getQuantity(eventId);
  }

  getItemsByDateAdded(descending: boolean = true): CartItem[] {
    return this.store.getItemsByDateAdded(descending);
  }

  getItemsByPrice(descending: boolean = true): CartItem[] {
    return this.store.getItemsByPrice(descending);
  }

  getItemTotalPrice(eventId: string): number {
    return this.store.getItemTotalPrice(eventId);
  }

  getItemsByGenre(genre: string): CartItem[] {
    return this.store.getItemsByGenre(genre);
  }

  getItemsByCountry(country: string): CartItem[] {
    return this.store.getItemsByCountry(country);
  }

  getAvailableItems(): CartItem[] {
    return this.store.getAvailableItems();
  }

  getUnavailableItems(): CartItem[] {
    return this.store.getUnavailableItems();
  }
}
