import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);

  listRecent(limit = 50): Observable<AuditLogResponse[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AuditLogResponse[]>(`${environment.apiUrl}/audit/logs`, { params });
  }
}
