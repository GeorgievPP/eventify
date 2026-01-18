// src/models/dto/order.dto.ts
import { UserRole } from '../auth';
import { OrderStatus } from '../orders';

// ORDERS-API
interface OrderUserDto {
  _id: string;
  email: string;
  role: UserRole;
}

export interface OrderItemDto {
  eventId: string; // 👈 ПРОМЕНЕНО от postId
  title: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  _id: string;
  userId: OrderUserDto;
  items: OrderItemDto[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CancelOrderResponseDto {
  message: string;
  order: OrderDto;
}

// History DTO
interface OrderHistoryUserDto {
  _id: string;
  email: string;
  role?: UserRole;
}

export interface OrderHistoryDto {
  _id: string;
  orderId: string;
  userId: OrderHistoryUserDto | null;
  action: 'created' | 'updated' | 'status_changed' | 'cancelled';
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  before: any | null;
  after: any | null;
  createdAt: string;
}

export interface OrderUpdatePayload {
  status?: OrderStatus;
  items?: { eventId: string; quantity: number }[]; // 👈 ПРОМЕНЕНО от postId
}
