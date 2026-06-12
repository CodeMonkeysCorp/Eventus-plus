import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuditLogResponse, EventResponse, RegistrationResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuditService } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { auditActionLabel, eventStatusLabel, roleLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly eventsService = inject(EventsService);
  private readonly registrationsService = inject(RegistrationsService);
  private readonly auditService = inject(AuditService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';

  events: EventResponse[] = [];
  registrations: RegistrationResponse[] = [];
  recentLogs: AuditLogResponse[] = [];

  readonly currentRole = this.authService.user?.role ?? 'PARTICIPANT';

  ngOnInit(): void {
    this.loadDashboard();
  }

  get isAdmin(): boolean {
    return this.currentRole === 'ADMIN';
  }

  get publishedEvents(): number {
    return this.events.filter((event) => event.status === 'PUBLISHED').length;
  }

  get checkedInRegistrations(): number {
    return this.registrations.filter((registration) => registration.status === 'CHECKED_IN').length;
  }

  formatDateTime(value: string | null): string {
    return formatDateTime(value);
  }

  eventStatusLabel(status: EventResponse['status']): string {
    return eventStatusLabel(status);
  }

  auditActionLabel(action: string): string {
    return auditActionLabel(action);
  }

  roleLabel(role: typeof this.currentRole): string {
    return roleLabel(role);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase()}`;
  }

  trackByEventId(_index: number, event: EventResponse): number {
    return event.id;
  }

  trackByLogId(_index: number, log: AuditLogResponse): number {
    return log.id;
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.isAdmin) {
      forkJoin({
        events: this.eventsService.listAdmin(),
        registrations: this.registrationsService.listAll(),
        logs: this.auditService.listRecent(6)
      }).subscribe({
        next: ({ events, registrations, logs }) => {
          this.events = events;
          this.registrations = registrations;
          this.recentLogs = logs;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar o painel.');
          this.loading = false;
        }
      });
      return;
    }

    forkJoin({
      events: this.eventsService.listPublic(),
      registrations: this.registrationsService.listAll()
    }).subscribe({
      next: ({ events, registrations }) => {
        this.events = events;
        this.registrations = registrations;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar o painel.');
        this.loading = false;
      }
    });
  }
}
