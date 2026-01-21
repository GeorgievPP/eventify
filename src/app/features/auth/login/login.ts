import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService, LoginFormService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/ui';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formService = inject(LoginFormService);
  private notifications = inject(NotificationService);

  formGroup: FormGroup = this.formService.createForm();

  isLoading = this.authService.isLoading;
  // authError = this.authService.error;

  returnUrl: string | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.returnUrl = params.get('returnUrl');
    });

    this.authService.clearError();
  }

  // ==========================================
  // Form Control Getters
  // ==========================================
  get emailControl(): AbstractControl | null {
    return this.formGroup.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.formGroup.get('password');
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

  get showPasswordInvalidError(): boolean {
    return (
      !!this.passwordControl &&
      this.passwordControl.touched &&
      this.passwordControl.hasError('minlength')
    );
  }

  // ==========================================
  // Submit Handler
  // ==========================================
  submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { email, password } = this.formGroup.value;

    if (!email || !password) return;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.notifications.showSuccess('Successfully logged in.');

        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.authService.navigateAfterLogin();
        }
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = this.authService.error();
        if (errorMsg) {
          this.notifications.showError(errorMsg);
        } else {
          this.notifications.showError('Login failed');
        }
        console.log('Login failed:', err);
      },
    });
  }
}
