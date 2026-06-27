import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserCreatePayload, UserResponse, UserStatusPayload, UserUpdatePayload } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/users`);
  }

  create(payload: UserCreatePayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiUrl}/users`, payload);
  }

  update(userId: number, payload: UserUpdatePayload): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${environment.apiUrl}/users/${userId}`, payload);
  }

  updateStatus(userId: number, payload: UserStatusPayload): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${userId}/status`, payload);
  }
}
