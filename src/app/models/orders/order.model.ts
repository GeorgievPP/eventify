import { UserRole } from "../auth/auth-user.model";

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'completed' 
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  eventId: string; 
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;  
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: UserRole;
  createdAt: number; 
  updatedAt?: number;
  totalPrice: number;
  status: OrderStatus;
  items: OrderItem[];
}