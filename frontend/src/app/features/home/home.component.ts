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

  get currentUser() {
    return this.authService.user;
  }

  get upcomingEvents(): EventResponse[] {
    return [...this.events]
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
      .slice(0, 3);
  }

  get checkedInCount(): number {
    return this.registrations.filter((registration) => registration.status === 'CHECKED_IN').length;
  }

  get heroTitle(): string {
    if (this.isStaff) {
      return 'Coordene eventos, acompanhe inscrições e confirme presenças sem perder o contexto.';
    }

    if (this.isParticipant) {
      return `Olá, ${this.currentUser?.fullName.split(' ')[0] ?? 'participante'}. Seus próximos eventos começam aqui.`;
    }

    return 'Gerencie eventos acadêmicos com inscrição, presença e trilha de auditoria.';
  }

  get heroSubtitle(): string {
    if (this.isStaff) {
      return 'O painel administrativo centraliza eventos, check-ins, relatórios e logs para a operação do projeto.';
    }

    if (this.isParticipant) {
      return 'Veja o que já está aberto para inscrição, acompanhe suas presenças e libere seus certificados.';
    }

    return 'Explore os eventos publicados e entre para acompanhar inscrições, certificados e administração segura.';
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
