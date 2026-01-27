import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order } from '../../../../../models/orders';

@Component({
  selector: 'app-dashboard-recent-orders',
  imports: [RouterLink],
  templateUrl: './dashboard-recent-orders.html',
  styleUrl: './dashboard-recent-orders.css',
})
export class DashboardRecentOrders {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  orders = input.required<Order[]>();
  periodLabel = input.required<string>();
  formatDate = input<(ts: number) => string>((ts) => new Date(ts).toLocaleString());

  formatCurrency = input<(v: number) => string>((v) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}
