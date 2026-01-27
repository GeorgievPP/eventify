import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class EventFormService {
  private formBuilder = inject(FormBuilder);

  createForm() {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      imageUrl: ['', Validators.required],
      genre: ['', [Validators.required, Validators.minLength(3)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      details: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],

      eventDate: ['', Validators.required], 
      eventTime: [''], 
      venue: ['', Validators.required],
      location: ['', Validators.required], 
      totalTickets: [0, [Validators.required, Validators.min(1)]],
    });
  }
}
