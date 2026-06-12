import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EventPayload, EventResponse, EventStatus } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { EventsService } from '../../core/services/events.service';
import { formatDateTime, toApiDateTime, toDateTimeLocalValue } from '../../shared/utils/date.utils';
import { eventStatusLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './events-admin.component.html',
  styleUrl: './events-admin.component.css'
})
export class AdminEventsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(EventsService);
  private readonly apiErrorService = inject(ApiErrorService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: [''],
    location: ['', [Validators.required, Validators.maxLength(160)]],
    startsAt: ['', [Validators.required]],
    endsAt: ['', [Validators.required]],
    capacity: [80, [Validators.required, Validators.min(1)]],
    status: ['DRAFT' as EventStatus, [Validators.required]]
  });

  loading = true;
  submitting = false;
  editingEventId: number | null = null;
  errorMessage = '';
  successMessage = '';
  events: EventResponse[] = [];

  readonly statusOptions: EventStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];

  ngOnInit(): void {
    this.loadEvents();
  }

  get isEditing(): boolean {
    return this.editingEventId !== null;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: EventPayload = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      location: raw.location.trim(),
      startsAt: toApiDateTime(raw.startsAt),
      endsAt: toApiDateTime(raw.endsAt),
      capacity: Number(raw.capacity),
      status: raw.status
    };

    this.submitting = true;
    const request$ = this.isEditing && this.editingEventId !== null
      ? this.eventsService.update(this.editingEventId, payload)
      : this.eventsService.create(payload);

    request$
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditing ? 'Evento atualizado com sucesso.' : 'Evento criado com sucesso.';
          this.resetForm();
          this.loadEvents();
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível salvar o evento.');
        }
      });
  }

  edit(event: EventResponse): void {
    this.editingEventId = event.id;
    this.successMessage = '';
    this.errorMessage = '';
    this.form.reset({
      title: event.title,
      description: event.description ?? '',
      location: event.location,
      startsAt: toDateTimeLocalValue(event.startsAt),
      endsAt: toDateTimeLocalValue(event.endsAt),
      capacity: event.capacity,
      status: event.status
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(event: EventResponse): void {
    if (!confirm(`Deseja remover o evento "${event.title}"?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.eventsService.delete(event.id).subscribe({
      next: () => {
        this.successMessage = 'Evento removido com sucesso.';
        if (this.editingEventId === event.id) {
          this.resetForm();
        }
        this.loadEvents();
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível remover o evento.');
      }
    });
  }

  formatDateTime(value: string): string {
    return formatDateTime(value);
  }

  eventStatusLabel(status: EventStatus): string {
    return eventStatusLabel(status);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase()}`;
  }

  trackByEventId(_index: number, event: EventResponse): number {
    return event.id;
  }

  private loadEvents(): void {
    this.loading = true;
    this.eventsService.listAdmin().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar os eventos.');
        this.loading = false;
      }
    });
  }

  private resetForm(): void {
    this.editingEventId = null;
    this.form.reset({
      title: '',
      description: '',
      location: '',
      startsAt: '',
      endsAt: '',
      capacity: 80,
      status: 'DRAFT'
    });
  }
}
