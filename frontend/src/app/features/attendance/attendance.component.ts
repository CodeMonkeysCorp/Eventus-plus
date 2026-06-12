import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistrationResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { registrationStatusLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  private readonly registrationsService = inject(RegistrationsService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  submittingRegistrationId: number | null = null;
  errorMessage = '';
  successMessage = '';

  registrations: RegistrationResponse[] = [];
  query = '';

  ngOnInit(): void {
    this.loadRegistrations();
  }

  get filteredRegistrations(): RegistrationResponse[] {
    const normalizedQuery = this.query.trim().toLowerCase();
    if (!normalizedQuery) {
      return this.registrations;
    }

    return this.registrations.filter((registration) =>
      registration.eventTitle.toLowerCase().includes(normalizedQuery) ||
      registration.participantName.toLowerCase().includes(normalizedQuery) ||
      registration.participantEmail.toLowerCase().includes(normalizedQuery)
    );
  }

  get pendingCount(): number {
    return this.registrations.filter((registration) => registration.status === 'REGISTERED').length;
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

  confirmCheckIn(registration: RegistrationResponse): void {
    if (registration.status === 'CHECKED_IN') {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.submittingRegistrationId = registration.id;

    this.registrationsService.checkIn(registration.id).subscribe({
      next: (updatedRegistration) => {
        this.registrations = this.registrations.map((current) =>
          current.id === updatedRegistration.id ? updatedRegistration : current
        );
        this.successMessage = 'Check-in confirmado com sucesso.';
        this.submittingRegistrationId = null;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível confirmar o check-in.');
        this.submittingRegistrationId = null;
      }
    });
  }

  trackByRegistrationId(_index: number, registration: RegistrationResponse): number {
    return registration.id;
  }

  private loadRegistrations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.registrationsService.listAll().subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar as inscrições.');
        this.loading = false;
      }
    });
  }
}
