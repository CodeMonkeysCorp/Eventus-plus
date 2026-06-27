import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventResponse, EventSummaryResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { EventsService } from '../../core/services/events.service';
import { ReportsService } from '../../core/services/reports.service';
import { CustomSelectComponent, CustomSelectOption, CustomSelectValue } from '../../shared/ui/custom-select.component';
import { eventStatusLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  private readonly reportsService = inject(ReportsService);
  private readonly apiErrorService = inject(ApiErrorService);

  loadingEvents = true;
  loadingSummary = false;
  errorMessage = '';

  events: EventResponse[] = [];
  summary: EventSummaryResponse | null = null;
  selectedEventId: number | null = null;

  get eventOptions(): CustomSelectOption[] {
    return this.events.map((event) => ({
      value: event.id,
      label: event.title
    }));
  }

  get hasMultipleEvents(): boolean {
    return this.events.length > 1;
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  onEventChange(value: CustomSelectValue): void {
    if (value === null) {
      this.selectedEventId = null;
      this.summary = null;
      return;
    }

    const eventId = Number(value);
    if (Number.isNaN(eventId)) {
      this.selectedEventId = null;
      this.summary = null;
      return;
    }

    this.selectedEventId = eventId;
    this.loadSummary(eventId);
  }

  eventStatusLabel(status: EventSummaryResponse['status']): string {
    return eventStatusLabel(status);
  }

  statusClass(status: string): string {
    return `status-pill is-${status.toLowerCase()}`;
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.errorMessage = '';

    this.eventsService.listAdmin().subscribe({
      next: (events) => {
        this.events = events;
        this.selectedEventId = resolveSelectedEventId(events, this.selectedEventId);
        this.loadingEvents = false;

        if (this.selectedEventId !== null) {
          this.loadSummary(this.selectedEventId);
          return;
        }

        this.summary = null;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar os eventos do relatório.');
        this.loadingEvents = false;
      }
    });
  }

  private loadSummary(eventId: number): void {
    this.loadingSummary = true;
    this.errorMessage = '';

    this.reportsService.eventSummary(eventId).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loadingSummary = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível gerar o resumo do evento.');
        this.loadingSummary = false;
      }
    });
  }
}

function resolveSelectedEventId(events: EventResponse[], currentSelectedEventId: number | null): number | null {
  if (events.length === 0) {
    return null;
  }

  if (currentSelectedEventId !== null && events.some((event) => event.id === currentSelectedEventId)) {
    return currentSelectedEventId;
  }

  return events[0].id;
}
