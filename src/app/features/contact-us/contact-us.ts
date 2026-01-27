import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from '../../core/services/ui';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  private fb = inject(FormBuilder);
  private notifications = inject(NotificationService);

  submitting = signal(false);

  formGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  // ---- errors (като вашите)
  get showNameRequiredError() {
    const c = this.formGroup.get('name');
    return !!c && c.touched && c.hasError('required');
  }

  get showEmailRequiredError() {
    const c = this.formGroup.get('email');
    return !!c && c.touched && c.hasError('required');
  }

  get showEmailInvalidError() {
    const c = this.formGroup.get('email');
    return !!c && c.touched && c.hasError('email');
  }

  get showSubjectRequiredError() {
    const c = this.formGroup.get('subject');
    return !!c && c.touched && c.hasError('required');
  }

  get showSubjectMinLengthError() {
    const c = this.formGroup.get('subject');
    return !!c && c.touched && c.hasError('minlength');
  }

  get showMessageRequiredError() {
    const c = this.formGroup.get('message');
    return !!c && c.touched && c.hasError('required');
  }

  get showMessageMinLengthError() {
    const c = this.formGroup.get('message');
    return !!c && c.touched && c.hasError('minlength');
  }

  submit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    // Засега: mock “send”
    setTimeout(() => {
      this.submitting.set(false);
      this.notifications.showSuccess('Message sent! Thanks for reaching out.');
      this.formGroup.reset();
    }, 500);
  }
}
