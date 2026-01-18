export interface BaseEvent {
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
  availableTickets?: number; 
}

export type EventOwnerRole = 'user' | 'poweruser' | 'admin';

export interface EventOwner {
  _id: string;
  email: string;
  role: EventOwnerRole;
}

export interface Event extends BaseEvent {
  _id: string;
  _ownerId: string;
  _createdOn: number;     

  availableTickets: number; 

  previousPrice?: number | null;
  priceChangedAt?: string | null;

  owner?: EventOwner;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: EventOwner | null;
  
  createdAtIso?: string;
  updatedAtIso?: string;
  
  ratingAvg?: number;
  ratingCount?: number;
}

// Helper computed properties (can be used in components)
export interface EventWithComputed extends Event {
  isPastEvent: boolean;   // eventDate < now
  isSoldOut: boolean;     // availableTickets === 0
  ticketsRemaining: number; // availableTickets
  eventDateFormatted: string; // Formatted date
}