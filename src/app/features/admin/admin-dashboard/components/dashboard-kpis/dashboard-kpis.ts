import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { OrderStatus } from '../../../../../models/orders';
import { StatusStat } from '../../admin-dashboard.types';


@Component({
  selector: 'app-dashboard-kpis',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard-kpis.html',
  styleUrl: './dashboard-kpis.css',
})
export class DashboardKpis {
  @Input({ required: true }) usersLoading!: boolean;
  @Input({ required: true }) totalUsers!: number;
  @Input({ required: true }) activeUsers!: number;
  @Input({ required: true }) deletedUsers!: number;

  @Input({ required: true }) totalOrders!: number;
  @Input({ required: true }) totalRevenue!: number;
  @Input({ required: true }) averageOrderValue!: number;
  @Input({ required: true }) periodLabel!: string;

  @Input({ required: true }) statusStats!: StatusStat[];

  @Input() statusLabel: (s: OrderStatus) => string = (s) => s;

  @Output() statusClick = new EventEmitter<OrderStatus>();
}
