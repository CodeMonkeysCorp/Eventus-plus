import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventPayload, EventResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly http = inject(HttpClient);

  listPublic(): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(`${environment.apiUrl}/events`);
  }

  listAdmin(): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(`${environment.apiUrl}/events/admin`);
  }

  create(payload: EventPayload): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${environment.apiUrl}/events`, payload);
  }

  update(eventId: number, payload: EventPayload): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${environment.apiUrl}/events/${eventId}`, payload);
  }

  delete(eventId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}`);
  }
}
