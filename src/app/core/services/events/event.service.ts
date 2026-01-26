import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

import { EventApiService } from './event-api.service';
import { EventStoreService } from './event-store.service';

import { BaseEvent, Event, EventHistoryEntry } from '../../../models/events';


@Injectable({
  providedIn: 'root',
})
export class EventService {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private readonly api = inject(EventApiService);
  private readonly store = inject(EventStoreService);

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _isLoadingSingle = signal(false);
  readonly isLoadingSingle = computed(() => this._isLoadingSingle());

  private readonly _isOperating = signal(false);
  readonly isOperating = computed(() => this._isOperating());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  // ==========================================
  // EXPOSE STORE PROPERTIES
  // ==========================================

  readonly events = this.store.events;
  readonly singleEvent = this.store.singleEvent;
  readonly totalEvents = this.store.totalEvents;
  readonly activeEventsCount = this.store.activeEventsCount;
  readonly deletedEventsCount = this.store.deletedEventsCount;
  readonly isEmpty = this.store.isEmpty;
  readonly hasSingleEvent = this.store.hasSingleEvent;

  // ==========================================
  // LOAD OPERATIONS
  // ==========================================

  loadAll(): Observable<Event[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.api.getAllEventsDesc().pipe(
      tap((events) => {
        this.store.setEvents(events);
        console.log(`[EventService] Loaded ${events.length} events`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Load all failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  loadAllAdmin(): Observable<Event[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.api.getAllEventsAdmin().pipe(
      tap((events) => {
        this.store.setEvents(events);
        console.log(`[EventService] Loaded ${events.length} events (admin)`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Load all admin failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  loadSingleEvent(id: string): Observable<Event> {
    this._isLoadingSingle.set(true);
    this._error.set(null);

    return this.api.getEvent(id).pipe(
      tap((event) => {
        this.store.setSingleEvent(event);
        console.log(`[EventService] Loaded single event: ${event.title}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Load single event failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoadingSingle.set(false);
      }),
    );
  }

  getById(id: string): Observable<Event> {
    return this.api.getEvent(id).pipe(
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Get by ID failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  create(event: BaseEvent): Observable<Event> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.createEvent(event).pipe(
      tap((newEvent) => {
        this.store.addEvent(newEvent);
        this._lastOperationSuccess.set(true);
        console.log(`[EventService] Event created: ${newEvent.title}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Create failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  update(event: Event): Observable<Event> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateEvent(event._id, event).pipe(
      tap((updatedEvent) => {
        this.store.updateEventInList(updatedEvent);
        this._lastOperationSuccess.set(true);
        console.log(`[EventService] Event updated: ${updatedEvent.title}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Update failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  delete(id: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.deleteEvent(id).pipe(
      tap(() => {
        this.store.removeEvent(id);

        this._lastOperationSuccess.set(true);
        console.log(`[EventService] Event deleted: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Delete failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  restore(id: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.restoreEvent(id).pipe(
      tap(() => {
        this.store.restoreEvent(id);
        this._lastOperationSuccess.set(true);
        console.log(`[EventService] Event restored: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Restore failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  hardDelete(id: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.hardDelete(id).pipe(
      tap(() => {
        this.store.removeEvent(id);
        this._lastOperationSuccess.set(true);
        console.log(`[EventService] Event hard-deleted: ${id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Hard delete failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // ADDITIONAL OPERATIONS
  // ==========================================

  rateEvent(id: string, value: number): Observable<Event> {
    this._isOperating.set(true);
    this._error.set(null);

    return this.api.rateEvent(id, value).pipe(
      tap((updatedEvent) => {
        this.store.updateEventInList(updatedEvent);
        console.log(`[EventService] Event rated: ${updatedEvent.title} (${value} stars)`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Rate event failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  getEventHistory(id: string): Observable<EventHistoryEntry[]> {
    return this.api.getEventHistory(id).pipe(
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[EventService] Get history failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================


  clearError(): void {
    this._error.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  clearSingleEvent(): void {
    this.store.clearSingleEvent();
  }

  clearAllEvents(): void {
    this.store.clearEvents();
  }

  // ==========================================
  // STORE QUERY HELPERS (Delegation)
  // ==========================================


  getEventFromStore(id: string): Event | null {
    return this.store.getEventById(id);
  }

  getActiveEvents(): Event[] {
    return this.store.getActiveEvents();
  }

  getDeletedEvents(): Event[] {
    return this.store.getDeletedEvents();
  }

  getUpcomingEvents(): Event[] {
    return this.store.getUpcomingEvents();
  }

  getPastEvents(): Event[] {
    return this.store.getPastEvents();
  }

  getTopRatedEvents(limit: number = 10): Event[] {
    return this.store.getTopRatedEvents(limit);
  }

  searchEventsByTitle(query: string): Event[] {
    return this.store.searchEventsByTitle(query);
  }

  getEventsByGenre(genre: string): Event[] {
    return this.store.getEventsByGenre(genre);
  }


  getEventsByCountry(country: string): Event[] {
    return this.store.getEventsByCountry(country);
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  /**
   * Extract user-friendly error message from HTTP error
   */
  private extractErrorMessage(error: any): string {
    if (error?.message && !error.message.startsWith('Http failure')) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Unauthorized. Please login.';
        case 403:
          return 'Access forbidden.';
        case 404:
          return 'Event not found.';
        case 409:
          return 'Conflict. Event may already exist.';
        case 500:
          return 'Server error. Please try again later.';
        case 0:
          return 'Cannot connect to server. Check your internet connection.';
        default:
          return error.statusText || 'An unexpected error occurred.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
