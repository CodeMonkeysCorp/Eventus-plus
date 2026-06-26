import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventResponse, RegistrationResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { eventStatusLabel, roleLabel } from '../../shared/utils/labels.utils';

type DashboardStat = {
  label: string;
  value: number;
  hint: string;
};

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
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';

  events: EventResponse[] = [];
  registrations: RegistrationResponse[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  get currentRole(): 'PARTICIPANT' | 'OPERATOR' | 'ADMIN' {
    return this.authService.user?.role ?? 'PARTICIPANT';
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

  get pendingRegistrations(): number {
    return this.registrations.filter((registration) => registration.status === 'REGISTERED').length;
  }

  get dashboardStats(): DashboardStat[] {
    const stats: DashboardStat[] = [
      { label: 'Eventos publicados', value: this.publishedEvents, hint: 'visíveis para os participantes' },
      { label: 'Inscrições pendentes', value: this.pendingRegistrations, hint: 'aguardando confirmação de presença' },
      { label: 'Presenças confirmadas', value: this.checkedInRegistrations, hint: 'já registradas no evento' }
    ];

    if (this.isAdmin) {
      return [
        { label: 'Eventos totais', value: this.events.length, hint: 'entre rascunhos e publicados' },
        ...stats
      ];
    }

    return stats;
  }

  get visibleEvents(): EventResponse[] {
    return [...this.events]
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
      .slice(0, 6);
  }

  formatDateTime(value: string | null): string {
    return formatDateTime(value);
  }

  eventStatusLabel(status: EventResponse['status']): string {
    return eventStatusLabel(status);
  }

  roleLabel(role: typeof this.currentRole): string {
    return roleLabel(role);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase().replace('_', '-')}`;
  }

  trackByEventId(_index: number, event: EventResponse): number {
    return event.id;
  }

  trackByStatLabel(_index: number, stat: DashboardStat): string {
    return stat.label;
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      events: this.isAdmin ? this.eventsService.listAdmin() : this.eventsService.listPublic(),
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
