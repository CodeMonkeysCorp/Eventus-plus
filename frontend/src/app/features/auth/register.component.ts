import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegisterPayload } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmPassword: ['', [Validators.required]]
  });

  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  submitAttempted = false;

  constructor() {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.user?.role ?? 'PARTICIPANT';
      void this.router.navigate([this.authService.redirectRouteFor(role)]);
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.submitAttempted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Revise os campos destacados para continuar.';
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.errorMessage = 'As senhas não conferem.';
      this.form.controls.confirmPassword.markAsTouched();
      return;
    }

    const payload: RegisterPayload = {
      fullName: this.form.controls.fullName.value.trim(),
      email: this.form.controls.email.value.trim().toLowerCase(),
      password: this.form.controls.password.value
    };

    this.loading = true;
    this.authService.register(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/home']);
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível concluir o cadastro.');
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordsMismatch(): boolean {
    return this.submitAttempted &&
      this.form.controls.password.value.length > 0 &&
      this.form.controls.confirmPassword.value.length > 0 &&
      this.form.controls.password.value !== this.form.controls.confirmPassword.value;
  }
}
