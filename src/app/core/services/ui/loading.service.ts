import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // колко активни HTTP заявки имаме в момента
  private _pendingRequests = signal(0);

  isLoading = computed(() => this._pendingRequests() > 0);

  show(): void {
    this._pendingRequests.update((count) => count + 1);
  }

  hide(): void {
    this._pendingRequests.update((count) => (count > 0 ? count - 1 : 0));
  }

  reset(): void {
    this._pendingRequests.set(0);
  }
}
