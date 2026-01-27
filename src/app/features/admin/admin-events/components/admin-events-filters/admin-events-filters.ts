import { Component, EventEmitter, input, Output } from '@angular/core';

import { EventFilter } from '../../admin-events.types';


@Component({
  selector: 'app-admin-events-filters',
  imports: [],
  templateUrl: './admin-events-filters.html',
  styleUrl: './admin-events-filters.css',
})
export class AdminEventsFilters {
  // ==========================================
  // INPUTS
  // ==========================================
  filter = input.required<EventFilter>();
  searchTerm = input.required<string>();

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() filterChange = new EventEmitter<EventFilter>();
  @Output() searchChange = new EventEmitter<string>();

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  setFilter(next: EventFilter): void {
    if (next === this.filter()) return; // Avoid unnecessary emits
    this.filterChange.emit(next);
  }

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }
}