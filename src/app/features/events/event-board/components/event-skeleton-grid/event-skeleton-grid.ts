import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-event-skeleton-grid',
  imports: [],
  templateUrl: './event-skeleton-grid.html',
  styleUrl: './event-skeleton-grid.css',
})
export class EventSkeletonGrid {
  count = input(6);

  items = computed(() => {
    return Array.from({ length: this.count() }, (_, i) => i + 1);
  });
}
