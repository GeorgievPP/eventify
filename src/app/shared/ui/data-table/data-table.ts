import { Component, computed, inject, input, signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DataTableColumn } from '../../../models/shared';

@Component({
  selector: 'app-data-table',
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T = any> {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private router = inject(Router);

  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  columns = input<DataTableColumn<T>[]>([]);
  rows = input<T[]>([]);
  rowKey = input<string>('id');
  emptyMessage = input<string>('No data.');
  actionsTemplate = input<TemplateRef<{ $implicit: T }>>();
  rowLink = input<((row: any) => string) | undefined>(undefined);
  rowClickable = input<boolean>(false);

  // ==========================================
  // SORT STATE
  // ==========================================
  sortKey = signal<string | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  sortedRows = computed(() => {
    const key = this.sortKey();
    if (!key) return this.rows();

    const col = this.columns().find((c) => c.key === key);
    if (!col) return this.rows();

    const copy = [...this.rows()];
    const dir = this.sortDir();

    copy.sort((a: any, b: any) => {
      const av = a?.[key];
      const bv = b?.[key];

      const res = this.compareValues(av, bv);
      return dir === 'asc' ? res : -res;
    });

    return copy;
  });

  // ==========================================
  // TRACK BY
  // ==========================================

  trackByRow = (index: number, row: any): any => {
    return row?.[this.rowKey()] ?? index;
  };

  // ==========================================
  // CELL VALUE EXTRACTION
  // ==========================================

  getCellValue(column: DataTableColumn<T>, row: T): string {
    if (column.format) {
      return column.format(row);
    }

    const value = (row as any)?.[column.key];
    return value == null ? '' : String(value);
  }

  // ==========================================
  // SORT ACTIONS
  // ==========================================

  onHeaderClick(column: DataTableColumn<T>): void {
    if (column.sortable === false) return;

    if (this.sortKey() === column.key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(column.key);
      this.sortDir.set('asc');
    }
  }

  // ==========================================
  // ROW ACTIONS
  // ==========================================

  onRowClick(row: any): void {
    if (!this.rowClickable() || !this.rowLink()) return;

    const linkFn = this.rowLink();
    if (!linkFn) return;

    const url = linkFn(row);
    if (url) this.router.navigateByUrl(url);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private compareValues(a: any, b: any): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    const as = String(a).toLowerCase();
    const bs = String(b).toLowerCase();

    if (as < bs) return -1;
    if (as > bs) return 1;
    return 0;
  }
}