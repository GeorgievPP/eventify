export type EventHistoryAction =
  | 'created'
  | 'updated'
  | 'soft_deleted'
  | 'restored'
  | 'hard_deleted';

export interface EventHistoryUser {
  _id: string;
  email: string;
  role?: 'user' | 'poweruser' | 'admin';
}

export interface EventHistoryEntry {
  _id: string;
  eventId: string;
  userId: EventHistoryUser | null;

  action: EventHistoryAction;
  before: any | null;
  after: any | null;

  createdAt: string;
}
