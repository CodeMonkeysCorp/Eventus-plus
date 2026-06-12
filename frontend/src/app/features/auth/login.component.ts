import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading = false;
  errorMessage = '';
  showPassword = false;
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

    this.loading = true;
    this.authService.login(this.form.getRawValue())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (session) => {
          const redirect = this.route.snapshot.queryParamMap.get('redirect');
          const target = redirect && redirect.startsWith('/')
            ? redirect
            : this.authService.redirectRouteFor(session.user.role);
          void this.router.navigateByUrl(target);
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao autenticar.');
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
