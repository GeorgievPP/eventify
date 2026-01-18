import { Event } from '../events/event.model';

export interface CartItem {
  event: Event;
  addedAt: number;
  quantity: number;
}