import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { CertificateResponse, EventResponse, RegistrationResponse } from '../../core/models';
import { CertificatesService } from '../../core/services/certificates.service';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { eventStatusLabel } from '../../shared/utils/labels.utils';

type HomeStat = {
  label: string;
  value: number;
  hint: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly eventsService = inject(EventsService);
  private readonly registrationsService = inject(RegistrationsService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';

  events: EventResponse[] = [];
  registrations: RegistrationResponse[] = [];
  certificates: CertificateResponse[] = [];

  ngOnInit(): void {
    this.loadHome();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isParticipant(): boolean {
    return this.authService.hasRole('PARTICIPANT');
  }

  get isStaff(): boolean {
    return this.authService.isStaff();
  }

  get upcomingEvents(): EventResponse[] {
    return [...this.events]
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
      .slice(0, 3);
  }

  get checkedInCount(): number {
    return this.registrations.filter((registration) => registration.status === 'CHECKED_IN').length;
  }

  get pendingRegistrations(): number {
    return this.registrations.filter((registration) => registration.status === 'REGISTERED').length;
  }

  get homeStats(): HomeStat[] {
    if (this.isParticipant) {
      return [
        { label: 'Inscrições', value: this.registrations.length, hint: 'ativas' },
        { label: 'Check-ins', value: this.checkedInCount, hint: 'confirmados' },
        { label: 'Certificados', value: this.certificates.length, hint: 'disponíveis' }
      ];
    }

    if (this.isStaff) {
      return [
        { label: 'Eventos', value: this.events.length, hint: 'publicados' },
        { label: 'Pendentes', value: this.pendingRegistrations, hint: 'para check-in' },
        { label: 'Check-ins', value: this.checkedInCount, hint: 'confirmados' }
      ];
    }

    return [];
  }

  get heroTitle(): string {
    if (this.isStaff) {
      return 'Operação de eventos em um painel só.';
    }

    if (this.isParticipant) {
      return 'Sua agenda.';
    }

    return 'Eventos, inscrições e presença em um só fluxo.';
  }

  get heroSubtitle(): string {
    if (this.isStaff) {
      return 'Agenda, inscrições e check-ins.';
    }

    if (this.isParticipant) {
      return 'Inscrições, presença e certificados.';
    }

    return 'Acesse a agenda e acompanhe tudo em um só lugar.';
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase().replace('_', '-')}`;
  }

  formatDateTime(value: string): string {
    return formatDateTime(value);
  }

  eventStatusLabel(status: EventResponse['status']): string {
    return eventStatusLabel(status);
  }

  trackByEventId(_index: number, event: EventResponse): number {
    return event.id;
  }

  trackByStatLabel(_index: number, stat: HomeStat): string {
    return stat.label;
  }

  private loadHome(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.isParticipant) {
      forkJoin({
        events: this.eventsService.listPublic(),
        registrations: this.registrationsService.listMine(),
        certificates: this.certificatesService.listMine()
      })
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: ({ events, registrations, certificates }) => {
            this.events = events;
            this.registrations = registrations;
            this.certificates = certificates;
          },
          error: (error: unknown) => {
            this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao carregar a página inicial.');
          }
        });
      return;
    }

    if (this.isStaff) {
      forkJoin({
        events: this.eventsService.listPublic(),
        registrations: this.registrationsService.listAll(),
        certificates: of([] as CertificateResponse[])
      })
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: ({ events, registrations, certificates }) => {
            this.events = events;
            this.registrations = registrations;
            this.certificates = certificates;
          },
          error: (error: unknown) => {
            this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao carregar a página inicial.');
          }
        });
      return;
    }

    forkJoin({
      events: this.eventsService.listPublic(),
      registrations: of([] as RegistrationResponse[]),
      certificates: of([] as CertificateResponse[])
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ events, registrations, certificates }) => {
          this.events = events;
          this.registrations = registrations;
          this.certificates = certificates;
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao carregar a página inicial.');
        }
      });
  }
}
