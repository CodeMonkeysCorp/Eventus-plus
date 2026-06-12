import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventSummaryResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly http = inject(HttpClient);

  eventSummary(eventId: number): Observable<EventSummaryResponse> {
    return this.http.get<EventSummaryResponse>(`${environment.apiUrl}/reports/events/${eventId}/summary`);
  }
}
