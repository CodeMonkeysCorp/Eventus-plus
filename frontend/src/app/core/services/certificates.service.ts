import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CertificateResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  private readonly http = inject(HttpClient);

  listMine(): Observable<CertificateResponse[]> {
    return this.http.get<CertificateResponse[]>(`${environment.apiUrl}/certificates/me`);
  }
}
