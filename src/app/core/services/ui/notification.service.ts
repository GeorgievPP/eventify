import { Injectable, signal } from '@angular/core';

import { Notification, NotificationType } from '../../../models/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  show(type: NotificationType, message: string, durationMs = 3000): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message };

    this._notifications.update((list) => [...list, notification]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }
  }

  showSuccess(message: string, durationMs = 2500): void {
    this.show('success', message, durationMs);
  }

  showError(message: string, durationMs = 3000): void {
    this.show('info', message, durationMs);
  }

  remove(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    // fallback за по-стар браузър
    return Math.random().toString(36).slice(2);
  }
}
