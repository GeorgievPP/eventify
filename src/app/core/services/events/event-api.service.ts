import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../constants';

import { BaseEvent, Event, EventHistoryEntry } from '../../../models/events';
import { ApiResponse } from '../../../models/shared';
import { EventDto, EventHistoryDto } from '../../../models/dto';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
    
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  // GET ALL EVENTS (sorted desc by creation)
  getAllEventsDesc(): Observable<Event[]> {
    return this.http.get<ApiResponse<EventDto[]>>(`${this.baseUrl}/events`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load events');
        }

        return res.data
          .map((dto) => this.mapEvent(dto))
          .sort((a, b) => b._createdOn - a._createdOn);
      }),
    );
  }

  // GET ALL EVENTS (sorted asc by creation)
  getAllEventsAsc(): Observable<Event[]> {
    return this.http.get<ApiResponse<EventDto[]>>(`${this.baseUrl}/events`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load events');
        }

        return res.data
          .map((dto) => this.mapEvent(dto))
          .sort((a, b) => a._createdOn - b._createdOn);
      }),
    );
  }

  // GET SINGLE EVENT
  getEvent(id: string): Observable<Event> {
    return this.http.get<ApiResponse<EventDto>>(`${this.baseUrl}/events/${id}`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load event');
        }

        return this.mapEvent(res.data);
      }),
    );
  }

  // CREATE EVENT
  createEvent(event: BaseEvent): Observable<Event> {
    return this.http.post<ApiResponse<EventDto>>(`${this.baseUrl}/events`, event).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to create event');
        }

        return this.mapEvent(res.data);
      }),
    );
  }

  // UPDATE EVENT
  updateEvent(id: string, event: Event): Observable<Event> {
    const payload = {
      title: event.title,
      imageUrl: event.imageUrl,
      genre: event.genre,
      country: event.country,
      details: event.details,
      price: event.price,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venue: event.venue,
      location: event.location,
      totalTickets: event.totalTickets,
    };

    return this.http.put<ApiResponse<EventDto>>(`${this.baseUrl}/events/${id}`, payload).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to update event');
        }

        return this.mapEvent(res.data);
      }),
    );
  }

  // SOFT DELETE
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/events/${id}`).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message || 'Failed to delete event');
        }
        return;
      }),
    );
  }

  // RESTORE
  restoreEvent(id: string): Observable<void> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/events/${id}/restore`, {}).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message || 'Failed to restore event');
        }
        return;
      }),
    );
  }

  // HARD DELETE
  hardDelete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/events/${id}/hard-delete`).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message || 'Failed to hard-delete event');
        }
        return;
      }),
    );
  }

  // ADMIN: GET ALL EVENTS (including deleted)
  getAllEventsAdmin(): Observable<Event[]> {
    return this.http.get<ApiResponse<EventDto[]>>(`${this.baseUrl}/events/all`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load all events');
        }

        return res.data
          .map((dto) => this.mapEvent(dto))
          .sort((a, b) => (b._createdOn ?? 0) - (a._createdOn ?? 0));
      }),
    );
  }

  // GET EVENT HISTORY
  getEventHistory(id: string): Observable<EventHistoryEntry[]> {
    return this.http
      .get<ApiResponse<EventHistoryDto[]>>(`${this.baseUrl}/events/${id}/history`)
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to load event history');
          }

          return res.data
            .map((dto) => this.mapEventHistory(dto))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }),
      );
  }

  // RATE EVENT
  rateEvent(id: string, value: number): Observable<Event> {
    return this.http
      .post<ApiResponse<EventDto>>(`${this.baseUrl}/events/${id}/rating`, { value })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to rate event');
          }
          return this.mapEvent(res.data);
        }),
      );
  }

  // =============================
  // PRIVATE MAPPING FUNCTIONS
  // =============================

  private mapEvent(dto: EventDto): Event {
    const createdTime = dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now();

    return {
      _id: dto._id,
      _ownerId: dto.owner?._id ?? '',
      _createdOn: createdTime,

      title: dto.title,
      imageUrl: dto.imageUrl,
      genre: dto.genre,
      country: dto.country,
      details: dto.details,
      price: dto.price,
      eventDate: dto.eventDate,
      eventTime: dto.eventTime,
      venue: dto.venue,
      location: dto.location,
      totalTickets: dto.totalTickets,
      availableTickets: dto.availableTickets,

      previousPrice: dto.previousPrice ?? null,
      priceChangedAt: dto.priceChangedAt ?? null,

      owner: dto.owner ?? undefined,
      isDeleted: dto.isDeleted,
      deletedAt: dto.deletedAt ?? null,
      deletedBy: dto.deletedBy ?? null,

      createdAtIso: dto.createdAt,
      updatedAtIso: dto.updatedAt,

      ratingAvg: dto.ratingAvg ?? 0,
      ratingCount: dto.ratingCount ?? 0,
    };
  }

  private mapEventHistory(dto: EventHistoryDto): EventHistoryEntry {
    return {
      _id: dto._id,
      eventId: dto.eventId,
      userId: dto.userId
        ? {
            _id: dto.userId._id,
            email: dto.userId.email,
            role: dto.userId.role,
          }
        : null,
      action: dto.action,
      before: dto.before,
      after: dto.after,
      createdAt: dto.createdAt,
    };
  }
}
