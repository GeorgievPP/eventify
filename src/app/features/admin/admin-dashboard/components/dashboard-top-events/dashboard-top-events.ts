import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopEvent } from '../../admin-dashboard.types';

/**
 * DashboardTopEvents Component
 *
 * Top events by revenue table for dashboard.
 * Pure presentational component.
 *
 * Features:
 * - Display top events by revenue
 * - Show event title, quantity sold, total revenue
 * - Link to event details
 * - Sortable table
 */
@Component({
  selector: 'app-dashboard-top-events',
  imports: [RouterLink],
  templateUrl: './dashboard-top-events.html',
  styleUrl: './dashboard-top-events.css',
})
export class DashboardTopEvents {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  events = input.required<TopEvent[]>();
  periodLabel = input.required<string>();

  formatCurrency = input<(v: number) => string>((v) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}
