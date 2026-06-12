import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistrationResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RegistrationsService {
  private readonly http = inject(HttpClient);

  register(eventId: number): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${environment.apiUrl}/registrations/events/${eventId}`, {});
  }

  listMine(): Observable<RegistrationResponse[]> {
    return this.http.get<RegistrationResponse[]>(`${environment.apiUrl}/registrations/me`);
  }

  listAll(): Observable<RegistrationResponse[]> {
    return this.http.get<RegistrationResponse[]>(`${environment.apiUrl}/registrations/admin`);
  }

  checkIn(registrationId: number): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${environment.apiUrl}/attendance/registrations/${registrationId}/check-in`, {});
  }
}
