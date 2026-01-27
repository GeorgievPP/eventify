import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';

import { NotificationService } from '../../../../core/services/ui';


@Component({
  selector: 'app-notifications',
  imports: [NgClass],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private notificationService = inject(NotificationService);

  // ==========================================
  // NOTIFICATIONS STATE (from service)
  // ==========================================
  notifications = this.notificationService.notifications;

  // ==========================================
  // ACTIONS
  // ==========================================

  close(id: string): void {
    this.notificationService.remove(id);
  }
}