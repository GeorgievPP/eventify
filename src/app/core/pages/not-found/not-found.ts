import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private location = inject(Location);

  // ==========================================
  // NAVIGATION ACTIONS
  // ==========================================
  goBack(): void {
    this.location.back();
  }
}