import { Component, inject } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { AuthService, RegisterFormService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/ui';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private formService = inject(RegisterFormService);
  private notifications = inject(NotificationService);

  formGroup: FormGroup = this.formService.createForm();

  isLoading = this.authService.isLoading;

  // ==========================================
  // Form Control Getters
  // ==========================================
  get emailControl(): AbstractControl | null {
    return this.formGroup.get('email');
  }

  get passwordsGroup(): AbstractControl | null {
    return this.formGroup.get('passwords');
  }

  get passwordControl(): AbstractControl | null {
    return this.formGroup.get('passwords.password');
  }

  get rePasswordControl(): AbstractControl | null {
    return this.formGroup.get('passwords.rePassword');
  }

  // ==========================================
  // Error Display Helpers
  // ==========================================
  get showEmailRequiredError(): boolean {
    return (
      !!this.emailControl && this.emailControl.touched && this.emailControl.hasError('required')
    );
  }

  get showEmailInvalidError(): boolean {
    return !!this.emailControl && this.emailControl.touched && this.emailControl.hasError('email');
  }

  get showPasswordRequiredError(): boolean {
    return (
      !!this.passwordControl &&
      this.passwordControl.touched &&
      this.passwordControl.hasError('required')
    );
  }

  get showPasswordMinLengthError(): boolean {
    return (
      !!this.passwordControl &&
      this.passwordControl.touched &&
      this.passwordControl.hasError('minlength')
    );
  }

  get showRePasswordRequiredError(): boolean {
    return (
      !!this.rePasswordControl &&
      this.rePasswordControl.touched &&
      this.rePasswordControl.hasError('required')
    );
  }

  get showPasswordsDontMatchError(): boolean {
    return (
      !!this.passwordsGroup &&
      this.passwordsGroup.touched &&
      this.passwordsGroup.hasError('passwordsDontMatch')
    );
  }

  // ==========================================
  // Submit Handler
  // ==========================================
  submit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { email, passwords } = this.formGroup.value as {
      email: string;
      passwords: { password: string; rePassword: string };
    };

    if (!email || !passwords.password) return;

    this.authService.clearError();

    this.authService.register(email, passwords.password).subscribe({
      next: () => {
        this.notifications.showSuccess('Account created successfully. Welcome!');
        this.authService.navigateAfterLogin();
      },
      error: (err) => {
        const errorMsg = this.authService.error();
        if (errorMsg) {
          this.notifications.showError(errorMsg);
        } else {
          this.notifications.showError('Registration failed');
        }

        console.log('Registration failed:', err);
      },
    });
  }
}
