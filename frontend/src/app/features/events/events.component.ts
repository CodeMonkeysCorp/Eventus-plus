import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { EventResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { RegistrationsService } from '../../core/services/registrations.service';
import { formatDateTime } from '../../shared/utils/date.utils';
import { eventStatusLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly eventsService = inject(EventsService);
  private readonly registrationsService = inject(RegistrationsService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  submittingEventId: number | null = null;
  errorMessage = '';
  successMessage = '';

  events: EventResponse[] = [];
  registeredEventIds = new Set<number>();

  ngOnInit(): void {
    this.loadData();
  }

  get isParticipant(): boolean {
    return this.authService.hasRole('PARTICIPANT');
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get visibleEvents(): EventResponse[] {
    return [...this.events]
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
  }

  canRegister(event: EventResponse): boolean {
    return this.isParticipant &&
      event.status === 'PUBLISHED' &&
      event.availableSpots > 0 &&
      !this.registeredEventIds.has(event.id);
  }

  register(event: EventResponse): void {
    if (!this.canRegister(event)) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.submittingEventId = event.id;

    this.registrationsService.register(event.id)
      .pipe(finalize(() => (this.submittingEventId = null)))
      .subscribe({
        next: () => {
          this.successMessage = 'Inscrição realizada com sucesso.';
          this.loadData();
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível concluir a inscrição.');
        }
      });
  }

  formatDateTime(value: string): string {
    return formatDateTime(value);
  }

  eventStatusLabel(status: EventResponse['status']): string {
    return eventStatusLabel(status);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase().replace('_', '-')}`;
  }

  trackByEventId(_index: number, event: EventResponse): number {
    return event.id;
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.isParticipant) {
      forkJoin({
        events: this.eventsService.listPublic(),
        registrations: this.registrationsService.listMine()
      })
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: ({ events, registrations }) => {
            this.events = events;
            this.registeredEventIds = new Set(registrations.map((registration) => registration.eventId));
          },
          error: (error: unknown) => {
            this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao carregar os eventos.');
          }
        });
      return;
    }

    this.eventsService.listPublic()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.registeredEventIds = new Set<number>();
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Falha ao carregar os eventos.');
        }
      });
  }
}
