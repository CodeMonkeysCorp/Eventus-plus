import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { roleLabel } from './shared/utils/labels.utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user$ = this.authService.user$;

  ngOnInit(): void {
    this.authService.validateSession().subscribe();
  }

  get isParticipant(): boolean {
    return this.authService.hasRole('PARTICIPANT');
  }

  get isStaff(): boolean {
    return this.authService.isStaff();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  roleLabel(role: 'PARTICIPANT' | 'OPERATOR' | 'ADMIN'): string {
    return roleLabel(role);
  }

  firstName(fullName: string): string {
    return fullName.trim().split(' ')[0] || 'Conta';
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
