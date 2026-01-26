import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../constants';
import { Order, OrderHistoryEntry, OrderItem, OrderStatus } from '../../../models/orders';
import { ApiResponse } from '../../../models/shared';
import {
  CancelOrderResponseDto,
  OrderDto,
  OrderHistoryDto,
  OrderItemDto,
} from '../../../models/dto';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  /**
   * GET /orders
   * user → само неговите
   * poweruser/admin → всички
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.baseUrl}/orders`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load orders');
        }

        return res.data.map((dto) => this.mapOrder(dto)).sort((a, b) => b.createdAt - a.createdAt);
      })
    );
  }

  /**
   * GET /orders/:id – детайл за поръчка
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<ApiResponse<OrderDto>>(`${this.baseUrl}/orders/${id}`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load order');
        }

        return this.mapOrder(res.data);
      })
    );
  }

  /**
   * POST /orders – създава поръчка за билети
   * items: [{ eventId, quantity }]
   */
  createOrderFromItems(items: { eventId: string; quantity: number }[]): Observable<Order> {
    return this.http.post<ApiResponse<OrderDto>>(`${this.baseUrl}/orders`, { items }).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to create order');
        }

        return this.mapOrder(res.data);
      })
    );
  }

  /**
   * PUT /orders/:id – update на статус и/или items (само admin/poweruser)
   */
  updateOrder(
    id: string,
    payload: {
      status?: OrderStatus;
      items?: { eventId: string; quantity: number }[];
    }
  ): Observable<Order> {
    return this.http.put<ApiResponse<OrderDto>>(`${this.baseUrl}/orders/${id}`, payload).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to update order');
        }

        return this.mapOrder(res.data);
      })
    );
  }

  /**
   * PATCH /orders/:id/cancel – маркира поръчка като cancelled
   * (връща билетите обратно)
   */
  cancelOrder(id: string): Observable<Order> {
    return this.http
      .patch<ApiResponse<CancelOrderResponseDto>>(`${this.baseUrl}/orders/${id}/cancel`, {})
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to cancel order');
          }

          return this.mapOrder(res.data.order);
        })
      );
  }

  /**
   * GET /orders/:id/history – timeline за поръчката
   */
  getOrderHistory(id: string): Observable<OrderHistoryEntry[]> {
    return this.http
      .get<ApiResponse<OrderHistoryDto[]>>(`${this.baseUrl}/orders/${id}/history`)
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to load order history');
          }

          return res.data
            .map((dto) => this.mapHistoryEntry(dto))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        })
      );
  }

  // =============================
  // PRIVATE MAPPING HELPERS
  // =============================

  private mapItems(dtos: OrderItemDto[]): OrderItem[] {
    return dtos.map((it) => {
      const quantity = it.quantity ?? 1;
      const unitPrice = it.unitPrice ?? 0;

      return {
        eventId: it.eventId,
        title: it.title,
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      };
    });
  }

  private mapOrder(dto: OrderDto): Order {
    const items: OrderItem[] = this.mapItems(dto.items);

    return {
      id: dto._id,
      userId: dto.userId?._id ?? '',
      userEmail: dto.userId?.email,
      userRole: dto.userId?.role,
      createdAt: new Date(dto.createdAt).getTime(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt).getTime() : undefined,
      totalPrice: dto.totalPrice,
      status: dto.status,
      items,
    };
  }

  private mapHistoryEntry(dto: OrderHistoryDto): OrderHistoryEntry {
    return {
      _id: dto._id,
      orderId: dto.orderId,
      userId: dto.userId
        ? {
            _id: dto.userId._id,
            email: dto.userId.email,
            role: dto.userId.role,
          }
        : null,
      action: dto.action,
      fromStatus: dto.fromStatus,
      toStatus: dto.toStatus,
      before: dto.before ? { items: dto.before.items } : null,
      after: dto.after ? { items: dto.after.items } : null,
      createdAt: dto.createdAt,
    };
  }
}
