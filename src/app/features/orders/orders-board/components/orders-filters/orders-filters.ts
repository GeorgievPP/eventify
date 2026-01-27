import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrderStatus } from '../../../../../models/orders';


@Component({
  selector: 'app-orders-filters',
  imports: [FormsModule],
  templateUrl: './orders-filters.html',
  styleUrl: './orders-filters.css',
})
export class OrdersFilters {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  isStaff = input<boolean>(false);
  isAdmin = input<boolean>(false);
  email = input<string>('');
  status = input<'all' | OrderStatus>('all');
  dateRange = input<'all' | '7d' | '30d' | 'thisMonth'>('all');
  statusOptions = input<{ value: 'all' | OrderStatus; label: string }[]>([]);
  dateRangeOptions = input<{ value: any; label: string }[]>([]);
  effectiveCount = input<number>(0);
  resultsCount = input<number>(0);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() emailChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<'all' | OrderStatus>();
  @Output() dateRangeChange = new EventEmitter<'all' | '7d' | '30d' | 'thisMonth'>();
  @Output() exportAll = new EventEmitter<void>();
  @Output() export30 = new EventEmitter<void>();
  @Output() export7 = new EventEmitter<void>();
  @Output() clearHistory = new EventEmitter<void>();
}