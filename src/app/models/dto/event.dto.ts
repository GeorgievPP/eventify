export interface EventOwnerDto {
  _id: string;
  email: string;
  role: 'user' | 'poweruser' | 'admin';
}

export interface EventDto {
  _id: string;
  title: string;
  imageUrl: string;
  genre: string;
  country: string;
  details: string;
  price: number;

  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  totalTickets: number;
  availableTickets: number;

  previousPrice?: number | null;
  priceChangedAt?: string | null;

  owner: EventOwnerDto;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: EventOwnerDto | null;

  createdAt: string;
  updatedAt: string;

  ratingAvg?: number | null;
  ratingCount?: number;
}

// HISTORY: GET /events/:id/history
export interface EventHistoryUserDto {
  _id: string;
  email: string;
  role?: 'user' | 'poweruser' | 'admin';
}

export interface EventHistoryDto {
  _id: string;
  eventId: string;
  userId: EventHistoryUserDto | null;
  action: 'created' | 'updated' | 'soft_deleted' | 'restored' | 'hard_deleted';
  before: any | null;
  after: any | null;
  createdAt: string;
}
