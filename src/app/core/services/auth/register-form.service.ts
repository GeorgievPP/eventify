import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RegisterFormService {
  private formBuilder: FormBuilder = inject(FormBuilder);

  createForm() {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      passwords: this.formBuilder.group(
        {
          password: ['', [Validators.required, Validators.minLength(6)]],
          rePassword: ['', [Validators.required]],
        },
        {
          validators: this.passwordsMatchValidator,
        },
      ),
    });
  }

  private passwordsMatchValidator(passwordsControl: AbstractControl): ValidationErrors | null {
    const password = passwordsControl.get('password');
    const rePassword = passwordsControl.get('rePassword');

    if (password && rePassword && password.value !== rePassword.value) {
      return { passwordsDontMatch: true };
    }

    return null;
  }
}
