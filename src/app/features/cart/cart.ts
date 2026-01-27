import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/orders';
import { EventService } from '../../core/services/events';
import { NotificationService } from '../../core/services/ui';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private cartService = inject(CartService);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private eventService = inject(EventService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // CART STATE (from service)
  // ==========================================
  items = this.cartService.items;
  itemsCount = this.cartService.itemsCount;
  totalPrice = this.cartService.totalPrice;

  // ==========================================
  // MODAL STATE
  // ==========================================
  clearModalOpen = signal(false);
  removeTargetId = signal<string | null>(null);

  // ==========================================
  // CART ACTIONS
  // ==========================================

  remove(id: string): void {
    this.cartService.remove(id);
    this.notifications.showSuccess('Event removed.');
  }

  clear(): void {
    this.cartService.clear();
    this.notifications.showSuccess('Selection cleared.');
  }

  increase(id: string): void {
    this.cartService.increase(id);
  }

  decrease(id: string): void {
    this.cartService.decrease(id);
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  checkout(): void {
    if (!this.items().length) {
      this.notifications.showError('No events selected.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.notifications.showError('You need to be logged in to complete booking.');
      this.router.navigate(['./login'], {
        queryParams: { returnUrl: '/cart' },
      });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.notifications.showError('Invalid user. Please log in again.');
      this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      return;
    }

    this.orderService
      .createOrderFromCart(this.items())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          console.log('[Cart] Order created:', order);
          this.notifications.showSuccess('Booking completed successfully');
          this.cartService.clear();

          this.eventService
            .loadAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                console.log('[Cart] Events refreshed with updated ticket counts');
              },
              error: (err) => {
                console.error('[Cart] Failed to refresh events:', err);
              },
            });

          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('[Cart] Error creating order:', err);
          this.notifications.showError('Failed to complete booking. Please try again.');
        },
      });
  }

  // ==========================================
  // CLEAR MODAL ACTIONS
  // ==========================================

  openClearModal(): void {
    if (!this.items().length) {
      this.notifications.showError('No events selected.');
      return;
    }
    this.clearModalOpen.set(true);
  }

  closeClearModal(): void {
    this.clearModalOpen.set(false);
  }

  confirmClear(): void {
    this.clear();
    this.clearModalOpen.set(false);
  }

  // ==========================================
  // REMOVE MODAL ACTIONS
  // ==========================================

  openRemoveModal(id: string): void {
    this.removeTargetId.set(id);
  }

  closeRemoveModal(): void {
    this.removeTargetId.set(null);
  }

  confirmRemove(): void {
    const id = this.removeTargetId();
    if (!id) return;

    this.remove(id);
    this.removeTargetId.set(null);
  }
}
