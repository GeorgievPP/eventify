import { Component, computed, input, signal } from '@angular/core';

import { EventHistoryEntry } from '../../../../../models/events';
import { EventFieldDiff } from '../../event-details.types';


@Component({
  selector: 'app-event-history',
  imports: [],
  templateUrl: './event-history.html',
  styleUrl: './event-history.css',
})
export class EventHistory {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  history = input.required<EventHistoryEntry[]>();
  loading = input<boolean>(false);

  // ==========================================
  // LOCAL UI STATE
  // ==========================================
  sortOrder = signal<'asc' | 'desc'>('asc');
  expandedIds = signal<Set<string>>(new Set());

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  sortedHistory = computed(() => {
    const list = [...this.history()];
    if (!list.length) return [];

    return this.sortOrder() === 'desc'
      ? list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  // ==========================================
  // UI HANDLERS
  // ==========================================

  toggleSort(): void {
    this.sortOrder.update((curr) => (curr === 'asc' ? 'desc' : 'asc'));
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleDetails(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  formatDate(value: number | string): string {
    const d = typeof value === 'number' ? new Date(value) : new Date(value);
    return d.toLocaleString();
  }

  formatHistoryAction(action: EventHistoryEntry['action']): string {
    switch (action) {
      case 'created':
        return 'Created';
      case 'updated':
        return 'Updated';
      case 'soft_deleted':
        return 'Soft deleted';
      case 'restored':
        return 'Restored';
      case 'hard_deleted':
        return 'Hard deleted';
      default:
        return action;
    }
  }

  compareEventSnapshots(entry: EventHistoryEntry): EventFieldDiff[] {
    const before = entry.before || {};
    const after = entry.after || {};
    const diffs: EventFieldDiff[] = [];

    const fields: { field: string; label: string }[] = [
      { field: 'title', label: 'Title' },
      { field: 'genre', label: 'Event Type' },
      { field: 'country', label: 'Country' },
      { field: 'price', label: 'Price' },
      { field: 'imageUrl', label: 'Image URL' },
      { field: 'eventDate', label: 'Event Date' },
      { field: 'venue', label: 'Venue' },
      { field: 'location', label: 'Location' },
      { field: 'totalTickets', label: 'Total Tickets' },
      { field: 'isDeleted', label: 'Deleted' },
    ];

    for (const f of fields) {
      const beforeVal = before[f.field];
      const afterVal = after[f.field];

      if (beforeVal === undefined && afterVal === undefined) continue;
      if (beforeVal === afterVal) continue;

      diffs.push({
        field: f.field,
        label: f.label,
        before: beforeVal,
        after: afterVal,
      });
    }

    return diffs;
  }

  isPriceUp(entry: EventHistoryEntry): boolean {
    const before = entry.before || {};
    const after = entry.after || {};

    if (before.price === undefined || after.price === undefined) return false;

    return Number(after.price) > Number(before.price);
  }
}
