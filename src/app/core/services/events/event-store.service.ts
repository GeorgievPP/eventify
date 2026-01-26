import { computed, Injectable, signal } from '@angular/core';

import { Event } from '../../../models/events';

@Injectable({
  providedIn: 'root',
})
export class EventStoreService {
  // ==========================================
  // PRIVATE STATE
  // ==========================================
  private readonly _events = signal<Event[]>([]);
  private readonly _singleEvent = signal<Event | null>(null);

  // ==========================================
  // PUBLIC COMPUTED PROPERTIES
  // ==========================================
  readonly events = computed(() => this._events());
  readonly singleEvent = computed(() => this._singleEvent());
  readonly totalEvents = computed(() => this._events().length);
  readonly activeEventsCount = computed(() => this._events().filter((e) => !e.isDeleted).length);
  readonly deletedEventsCount = computed(() => this._events().filter((e) => e.isDeleted).length);
  readonly isEmpty = computed(() => this._events().length === 0);
  readonly hasSingleEvent = computed(() => this._singleEvent() !== null);

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  setEvents(events: Event[]): void {
    this._events.set(events);
    console.log(`[EventStore] Events set: ${events.length} events`);
  }

  setSingleEvent(event: Event | null): void {
    this._singleEvent.set(event);

    if (event) {
      console.log(`[EventStore] Single event set: ${event.title} (ID: ${event._id})`);
      this.updateEventInList(event);
    } else {
      console.log('[EventStore] Single event cleared');
    }
  }

  clearSingleEvent(): void {
    this._singleEvent.set(null);
    console.log('[EventStore] Single event cleared');
  }

  addEvent(event: Event): void {
    this._events.update((events) => [event, ...events]);
    console.log(`[EventStore] Event added: ${event.title} (ID: ${event._id})`);
  }

  updateEventInList(updatedEvent: Event): void {
    this._events.update((events) => {
      const index = events.findIndex((e) => e._id === updatedEvent._id);

      if (index === -1) {
        console.log(`[EventStore] Event not in list, adding: ${updatedEvent.title}`);
        return [updatedEvent, ...events];
      }

      const newEvents = [...events];
      newEvents[index] = updatedEvent;
      console.log(`[EventStore] Event updated in list: ${updatedEvent.title}`);
      return newEvents;
    });

    this._singleEvent.update((current) =>
      current && current._id === updatedEvent._id ? updatedEvent : current,
    );
  }

  removeEvent(id: string): void {
    this._events.update((events) => {
      const event = events.find((e) => e._id === id);

      if (event) {
        console.log(`[EventStore] Event removed: ${event.title} (ID: ${id})`);
      }
      return events.filter((e) => e._id !== id);
    });

    this._singleEvent.update((current) => (current && current._id === id ? null : current));
  }

  markEventAsDeleted(id: string): void {
    this._events.update((events) =>
      events.map((e) =>
        e._id === id ? { ...e, isDeleted: true, deletedAt: new Date().toISOString() } : e,
      ),
    );
    console.log(`[EventStore] Event marked as deleted: ${id}`);
  }

  restoreEvent(id: string): void {
    this._events.update((events) =>
      events.map((e) =>
        e._id === id ? { ...e, isDeleted: false, deletedAt: null, deletedBy: null } : e,
      ),
    );

    console.log(`[EventStore] Event restored: ${id}`);
  }

  clearEvents(): void {
    this._events.set([]);
    this._singleEvent.set(null);
    console.log('[EventStore] All events cleared');
  }

  // ==========================================
  // PUBLIC QUERY METHODS
  // ==========================================

  getEventById(id: string): Event | null {
    return this._events().find((e) => e._id === id) ?? null;
  }

  getActiveEvents(): Event[] {
    return this._events().filter((e) => !e.isDeleted);
  }

  getDeletedEvents(): Event[] {
    return this._events().filter((e) => e.isDeleted);
  }

  getEventsByGenre(genre: string): Event[] {
    const lowerGenre = genre.toLowerCase();
    return this._events().filter((e) => !e.isDeleted && e.genre.toLowerCase() === lowerGenre);
  }

  getEventsByCountry(country: string): Event[] {
    const lowerCountry = country.toLowerCase();
    return this._events().filter((e) => !e.isDeleted && e.country.toLowerCase() === lowerCountry);
  }

  searchEventsByTitle(query: string): Event[] {
    const lowerQuery = query.toLowerCase();
    return this._events().filter((e) => !e.isDeleted && e.title.toLowerCase().includes(lowerQuery));
  }

  getUpcomingEvents(): Event[] {
    const now = new Date();
    return this._events()
      .filter((e) => {
        if (e.isDeleted) {
          return false;
        }

        const eventDate = new Date(e.eventDate);
        return eventDate > now;
      })
      .sort((a, b) => {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });
  }

  getPastEvents(): Event[] {
    const now = new Date();
    return this._events()
      .filter((e) => {
        if (e.isDeleted) {
          return false;
        }

        const eventDate = new Date(e.eventDate);
        return eventDate <= now;
      })
      .sort((a, b) => {
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      });
  }

  getAvailableEvents(): Event[] {
    return this._events().filter((e) => !e.isDeleted && e.availableTickets > 0);
  }

  getSoldOutEvents(): Event[] {
    return this._events().filter((e) => !e.isDeleted && e.availableTickets === 0);
  }

  getTopRatedEvents(limit: number = 10): Event[] {
    return this._events()
      .filter((e) => !e.isDeleted && (e.ratingCount ?? 0) > 0)
      .sort((a, b) => {
        const avgDiff = (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0);

        if (avgDiff !== 0) return avgDiff;
        return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      })
      .slice(0, limit);
  }
}
