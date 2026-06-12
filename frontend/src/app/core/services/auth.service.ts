import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession, LoginPayload, RegisterPayload, UserResponse, UserRole } from '../models';

const SESSION_STORAGE_KEY = 'eventus_plus_session';

type SessionTokenClaims = {
  sub: string;
  role: UserRole;
  exp: number;
  name?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.readStoredSession());
  private validationRequest$: Observable<AuthSession | null> | null = null;
  private sessionValidated = false;

  readonly session$ = this.sessionSubject.asObservable();
  readonly user$ = this.session$.pipe(map((session) => session?.user ?? null));
  readonly isAuthenticated$ = this.session$.pipe(map((session) => session !== null));

  login(payload: LoginPayload): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((session) => this.storeSession(session, true))
    );
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((session) => this.storeSession(session, true))
    );
  }

  validateSession(): Observable<AuthSession | null> {
    const session = this.getActiveSession();
    if (!session) {
      return of(null);
    }

    if (this.sessionValidated) {
      return of(session);
    }

    if (this.validationRequest$) {
      return this.validationRequest$;
    }

    this.validationRequest$ = this.http.get<UserResponse>(`${environment.apiUrl}/auth/me`).pipe(
      map((user) => ({ token: session.token, user })),
      tap((validatedSession) => this.storeSession(validatedSession, true)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      finalize(() => {
        this.validationRequest$ = null;
        this.sessionValidated = this.sessionSubject.value !== null;
      }),
      shareReplay(1)
    );

    return this.validationRequest$;
  }

  logout(): void {
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return this.getActiveSession() !== null;
  }

  isStaff(): boolean {
    const role = this.getActiveSession()?.user.role;
    return role === 'ADMIN' || role === 'OPERATOR';
  }

  hasRole(role: UserRole): boolean {
    return this.getActiveSession()?.user.role === role;
  }

  redirectRouteFor(role: UserRole): string {
    return role === 'PARTICIPANT' ? '/home' : '/painel';
  }

  get token(): string | null {
    return this.getActiveSession()?.token ?? null;
  }

  get session(): AuthSession | null {
    return this.getActiveSession();
  }

  get user(): UserResponse | null {
    return this.getActiveSession()?.user ?? null;
  }

  private storeSession(session: AuthSession, validated: boolean): void {
    if (!this.isSessionStructurallyValid(session)) {
      this.clearSession();
      return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.sessionSubject.next(session);
    this.sessionValidated = validated;
  }

  private clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.sessionSubject.next(null);
    this.sessionValidated = false;
    this.validationRequest$ = null;
  }

  private getActiveSession(): AuthSession | null {
    const session = this.sessionSubject.value;
    if (!session) {
      return null;
    }

    if (!this.isSessionStructurallyValid(session)) {
      this.clearSession();
      return null;
    }

    return session;
  }

  private readStoredSession(): AuthSession | null {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawSession) as Partial<AuthSession>;
      if (!this.isSessionStructurallyValid(parsed)) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  private isSessionStructurallyValid(session: Partial<AuthSession> | null): session is AuthSession {
    if (!session || typeof session.token !== 'string' || !session.user) {
      return false;
    }

    const user = session.user as Partial<UserResponse>;
    const hasValidRole = user.role === 'ADMIN' || user.role === 'OPERATOR' || user.role === 'PARTICIPANT';
    if (
      typeof user.id !== 'number' ||
      typeof user.fullName !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.active !== 'boolean' ||
      typeof user.createdAt !== 'string' ||
      !hasValidRole
    ) {
      return false;
    }

    const role = user.role as UserRole;
    return this.matchesTokenClaims(
      {
        email: user.email,
        role,
        fullName: user.fullName
      },
      this.readTokenClaims(session.token)
    );
  }

  private matchesTokenClaims(
    user: Pick<UserResponse, 'email' | 'role' | 'fullName'>,
    claims: SessionTokenClaims | null
  ): boolean {
    if (!claims) {
      return false;
    }

    return (
      claims.sub.trim().toLowerCase() === user.email.trim().toLowerCase() &&
      claims.role === user.role &&
      (!claims.name || claims.name.trim() === user.fullName.trim())
    );
  }

  private readTokenClaims(token: string): SessionTokenClaims | null {
    const payload = this.parseJwtPayload(token);
    if (!payload) {
      return null;
    }

    const sub = payload['sub'];
    const role = payload['role'];
    const exp = payload['exp'];
    const name = payload['name'];

    if (
      typeof sub !== 'string' ||
      (role !== 'ADMIN' && role !== 'OPERATOR' && role !== 'PARTICIPANT') ||
      typeof exp !== 'number'
    ) {
      return null;
    }

    if (exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      sub,
      role,
      exp,
      name: typeof name === 'string' ? name : undefined
    };
  }

  private parseJwtPayload(token: string): Record<string, unknown> | null {
    const segments = token.split('.');
    if (segments.length !== 3 || typeof globalThis.atob !== 'function') {
      return null;
    }

    try {
      const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = (4 - (base64.length % 4)) % 4;
      const normalized = base64 + '='.repeat(padding);
      return JSON.parse(globalThis.atob(normalized)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
