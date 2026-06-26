import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegisterPayload } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';

type RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword';

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
      return;
    }

    if (this.passwordsMismatch) {
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

  fieldInvalid(field: RegisterField): boolean {
    const control = this.form.controls[field];
    if (field === 'confirmPassword' && this.passwordsMismatch) {
      return true;
    }

    return control.invalid && (control.touched || this.submitAttempted);
  }

  fieldError(field: RegisterField): string {
    const control = this.form.controls[field];
    if (!this.fieldInvalid(field)) {
      return '';
    }

    if (field === 'fullName') {
      if (control.hasError('required')) {
        return 'Informe seu nome.';
      }

      if (control.hasError('minlength')) {
        return 'Use pelo menos 3 caracteres.';
      }
    }

    if (field === 'email') {
      if (control.hasError('required')) {
        return 'Informe seu email.';
      }

      if (control.hasError('email')) {
        return 'Digite um email válido.';
      }
    }

    if (field === 'password') {
      if (control.hasError('required')) {
        return 'Informe uma senha.';
      }

      if (control.hasError('minlength')) {
        return 'Use no mínimo 8 caracteres.';
      }
    }

    if (field === 'confirmPassword') {
      if (control.hasError('required')) {
        return 'Confirme sua senha.';
      }

      if (this.passwordsMismatch) {
        return 'As senhas precisam ser iguais.';
      }
    }

    return 'Revise este campo.';
  }
}
