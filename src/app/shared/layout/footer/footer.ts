import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private authService = inject(AuthService);
  // private router = inject(Router);

  // ==========================================
  // AUTH STATE (from service)
  // ==========================================
  isLoggedIn = this.authService.isLoggedIn;
  isStaff = this.authService.isStaff;

  // ==========================================
  // STATIC DATA
  // ==========================================
  currentYear = new Date().getFullYear();

  // ==========================================
  // UI ACTIONS
  // ==========================================

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}