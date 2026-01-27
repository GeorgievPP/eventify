import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { BaseEvent } from '../../../models/events';

import { EventFormService, EventService } from '../../../core/services/events';
import { NotificationService } from '../../../core/services/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-create',
  imports: [ReactiveFormsModule],
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private eventService = inject(EventService);
  private router = inject(Router);
  private formService = inject(EventFormService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // FORM
  // ==========================================
  formGroup: FormGroup = this.formService.createForm();

  // ==========================================
  // STATE FROM SERVICE
  // ==========================================
  submitting = this.eventService.isOperating;
  error = this.eventService.error;

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

  get showCountryMinLengthError(): boolean {
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

  get showDetailsMinLengthError(): boolean {
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
    if (this.formGroup.invalid) {
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

    const payload: BaseEvent = {
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
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Event created successfully.');
          this.router.navigate(['/events']);
        },
        error: () => {
          const err = this.error();
          if (err) {
            this.notification.showError(err);
          } else {
            this.notification.showError('Failed to create event.');
          }
        },
      });
  }
}
