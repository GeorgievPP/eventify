import { Component, EventEmitter, input, Output } from '@angular/core';

import { DashboardPeriodType } from '../../admin-dashboard.types';

@Component({
  selector: 'app-dashboard-period',
  imports: [],
  templateUrl: './dashboard-period.html',
  styleUrl: './dashboard-period.css',
})
export class DashboardPeriod {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  period = input.required<DashboardPeriodType>();
  label = input.required<string>();

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() periodChange = new EventEmitter<DashboardPeriodType>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  setPeriod(p: DashboardPeriodType): void {
    if (p === this.period()) return;
    this.periodChange.emit(p);
  }
}
