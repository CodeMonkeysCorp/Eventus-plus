import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiErrorService } from '../../core/services/api-error.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { registrationStatusLabel } from '../../shared/utils/labels.utils';
import { RegistrationResponse } from '../../core/models';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.css'
})
export class RegistrationsComponent implements OnInit {
  private readonly registrationsService = inject(RegistrationsService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';
  registrations: RegistrationResponse[] = [];

  ngOnInit(): void {
    this.loadRegistrations();
  }

  get checkedInCount(): number {
    return this.registrations.filter((registration) => registration.status === 'CHECKED_IN').length;
  }

  formatDateTime(value: string | null): string {
    return formatDateTime(value);
  }

  registrationStatusLabel(status: RegistrationResponse['status']): string {
    return registrationStatusLabel(status);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase().replace('_', '-')}`;
  }

  trackByRegistrationId(_index: number, registration: RegistrationResponse): number {
    return registration.id;
  }

  private loadRegistrations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.registrationsService.listMine().subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar suas inscrições.');
        this.loading = false;
      }
    });
  }
}
