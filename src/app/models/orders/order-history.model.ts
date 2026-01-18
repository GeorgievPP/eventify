import { UserRole } from '../auth/auth-user.model';
import { OrderStatus } from './order.model';

export type OrderHistoryAction = 'created' | 'updated' | 'status_changed' | 'cancelled';

export interface OrderHistoryUser {
  _id: string;
  email: string;
  role?: UserRole;
}

export interface OrderHistoryItem {
  eventId: string;
  title: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderHistoryEntry {
  _id: string;
  orderId: string;
  userId: OrderHistoryUser | null;

  action: OrderHistoryAction;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;

  before: { items: OrderHistoryItem[] } | null;
  after: { items: OrderHistoryItem[] } | null;

  createdAt: string;
}
