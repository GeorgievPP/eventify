import { Component, computed, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { ThemeService } from '../../../core/services/ui';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);
  public theme = inject(ThemeService);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  user = this.authService.user;
  isLoggedIn = this.authService.isLoggedIn;
  isLoading = this.authService.isLoading;
  isAdmin = this.authService.isAdmin;
  isPowerUser = this.authService.isPowerUser;
  isStaff = this.authService.isStaff;

  // ==========================================
  // CART STATE (from service)
  // ==========================================
  cartItemsCount = this.cartService.itemsCount;

  // ==========================================
  // LOCAL UI STATE
  // ==========================================
  isMenuOpen = false;

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  ordersLabel = computed(() => (this.isStaff() ? 'All Orders' : 'My Tickets'));

  // ==========================================
  // UI ACTIONS
  // ==========================================

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.closeMenu();
      });
  }
}