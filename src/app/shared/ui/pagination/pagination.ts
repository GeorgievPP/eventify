import { Component, computed, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  current = input<number>(1);
  total = input<number>(1);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() pageChange = new EventEmitter<number>();

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  pages = computed(() => {
    const t = Math.max(1, this.total());
    return Array.from({ length: t }, (_, i) => i + 1);
  });

  isFirstPage = computed(() => this.current() === 1);

  isLastPage = computed(() => this.current() === this.total());

  // ==========================================
  // NAVIGATION ACTIONS
  // ==========================================

  prev(): void {
    const next = this.current() - 1;
    if (next >= 1) this.pageChange.emit(next);
  }

  next(): void {
    const next = this.current() + 1;
    if (next <= this.total()) this.pageChange.emit(next);
  }

  go(page: number): void {
    if (page < 1 || page > this.total()) return;
    this.pageChange.emit(page);
  }
}
