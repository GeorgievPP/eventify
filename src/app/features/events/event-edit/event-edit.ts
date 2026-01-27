import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Event } from '../../../models/events';

import { EventFormService, EventService } from '../../../core/services/events';
import { NotificationService } from '../../../core/services/ui';

@Component({
  selector: 'app-event-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './event-edit.html',
  styleUrl: './event-edit.css',
})
export class EventEdit implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formService = inject(EventFormService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // FORM
  // ==========================================
  formGroup: FormGroup = this.formService.createForm();

  // ==========================================
  // STATE
  // ==========================================
  id: string | null = null;
  currentEvent: Event | null = null;
  loading = this.eventService.isLoadingSingle;
  submitting = this.eventService.isOperating;
  error = this.eventService.error;

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      this.notification.showError('Invalid event ID');
      this.router.navigate(['/events']);
      return;
    }

    this.loadEvent(this.id);
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private loadEvent(id: string): void {
    this.eventService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          this.currentEvent = event;

          this.formGroup.patchValue({
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
          });
        },
        error: () => {
          const err = this.error();
          if (err) {
            this.notification.showError(err);
          } else {
            this.notification.showError('Failed to load event for edit');
          }
          this.router.navigate(['/events']);
        },
      });
  }

  // ==========================================
  // FORM CONTROL GETTERS
  // ==========================================

  get titleControl(): AbstractControl | null {
    return this.formGroup.get('title');
  }

  get imageUrlControl(): AbstractControl | null {
    return this.formGroup.get('imageUrl');
  }

  get genreControl(): AbstractControl | null {
    return this.formGroup.get('genre');
  }

  get countryControl(): AbstractControl | null {
    return this.formGroup.get('country');
  }

  get detailsControl(): AbstractControl | null {
    return this.formGroup.get('details');
  }

  get priceControl(): AbstractControl | null {
    return this.formGroup.get('price');
  }

  get eventDateControl(): AbstractControl | null {
    return this.formGroup.get('eventDate');
  }

  get eventTimeControl(): AbstractControl | null {
    return this.formGroup.get('eventTime');
  }

  get venueControl(): AbstractControl | null {
    return this.formGroup.get('venue');
  }

  get locationControl(): AbstractControl | null {
    return this.formGroup.get('location');
  }

  get totalTicketsControl(): AbstractControl | null {
    return this.formGroup.get('totalTickets');
  }

  // ==========================================
  // ERROR GETTERS (Title)
  // ==========================================

  get showTitleRequiredError(): boolean {
    return (
      !!this.titleControl && this.titleControl.touched && this.titleControl.hasError('required')
    );
  }

  get showTitleMinLengthError(): boolean {
    return (
      !!this.titleControl && this.titleControl.touched && this.titleControl.hasError('minlength')
    );
  }

  // ==========================================
  // ERROR GETTERS (Image)
  // ==========================================

  get showImageUrlRequiredError(): boolean {
    return (
      !!this.imageUrlControl &&
      this.imageUrlControl.touched &&
      this.imageUrlControl.hasError('required')
    );
  }

  // ==========================================
  // ERROR GETTERS (Genre)
  // ==========================================

  get showGenreRequiredError(): boolean {
    return (
      !!this.genreControl && this.genreControl.touched && this.genreControl.hasError('required')
    );
  }

  get showGenreMinLengthError(): boolean {
    return (
      !!this.genreControl && this.genreControl.touched && this.genreControl.hasError('minlength')
    );
  }

  // ==========================================
  // ERROR GETTERS (Country)
  // ==========================================

  get showCountryRequiredError(): boolean {
    return (
      !!this.countryControl &&
      this.countryControl.touched &&
      this.countryControl.hasError('required')
    );
  }

  get showCountryMinLength(): boolean {
    return (
      !!this.countryControl &&
      this.countryControl.touched &&
      this.countryControl.hasError('minlength')
    );
  }

  // ==========================================
  // ERROR GETTERS (Details)
  // ==========================================

  get showDetailsRequiredError(): boolean {
    return (
      !!this.detailsControl &&
      this.detailsControl.touched &&
      this.detailsControl.hasError('required')
    );
  }

  get showDetailsMinLength(): boolean {
    return (
      !!this.detailsControl &&
      this.detailsControl.touched &&
      this.detailsControl.hasError('minlength')
    );
  }

  // ==========================================
  // ERROR GETTERS (Price)
  // ==========================================

  get showPriceRequiredError(): boolean {
    return (
      !!this.priceControl && this.priceControl.touched && this.priceControl.hasError('required')
    );
  }

  get showPriceMinError(): boolean {
    return !!this.priceControl && this.priceControl.touched && this.priceControl.hasError('min');
  }

  // ==========================================
  // ERROR GETTERS (Event Date)
  // ==========================================

  get showEventDateRequiredError(): boolean {
    return (
      !!this.eventDateControl &&
      this.eventDateControl.touched &&
      this.eventDateControl.hasError('required')
    );
  }

  // ==========================================
  // ERROR GETTERS (Venue)
  // ==========================================

  get showVenueRequiredError(): boolean {
    return (
      !!this.venueControl && this.venueControl.touched && this.venueControl.hasError('required')
    );
  }

  // ==========================================
  // ERROR GETTERS (Location)
  // ==========================================

  get showLocationRequiredError(): boolean {
    return (
      !!this.locationControl &&
      this.locationControl.touched &&
      this.locationControl.hasError('required')
    );
  }

  // ==========================================
  // ERROR GETTERS (Total Tickets)
  // ==========================================

  get showTotalTicketsRequiredError(): boolean {
    return (
      !!this.totalTicketsControl &&
      this.totalTicketsControl.touched &&
      this.totalTicketsControl.hasError('required')
    );
  }

  get showTotalTicketsMinError(): boolean {
    return (
      !!this.totalTicketsControl &&
      this.totalTicketsControl.touched &&
      this.totalTicketsControl.hasError('min')
    );
  }

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  submit(): void {
    if (this.formGroup.invalid || !this.currentEvent) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const {
      title,
      imageUrl,
      genre,
      country,
      details,
      price,
      eventDate,
      eventTime,
      venue,
      location,
      totalTickets,
    } = this.formGroup.value;

    const payload: Event = {
      ...this.currentEvent,
      title,
      imageUrl,
      genre,
      country,
      details,
      price: Number(price) || 0,
      eventDate,
      eventTime: eventTime || '',
      venue,
      location,
      totalTickets: Number(totalTickets) || 0,
    };

    this.eventService
      .update(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.notification.showSuccess('Event updated successfully.');
          this.router.navigate(['/details-event', updated._id]);
        },
        error: () => {
          const err = this.error();
          if (err) {
            this.notification.showError(err);
          } else {
            this.notification.showError('Failed to update event.');
          }
        },
      });
  }
}
