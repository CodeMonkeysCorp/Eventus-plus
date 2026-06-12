import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { participantGuard } from './core/guards/participant.guard';
import { staffGuard } from './core/guards/staff.guard';
import { AdminDashboardComponent } from './features/admin/dashboard.component';
import { AdminEventsComponent } from './features/admin/events-admin.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { AuditComponent } from './features/audit/audit.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { CertificatesComponent } from './features/certificates/certificates.component';
import { EventsComponent } from './features/events/events.component';
import { HomeComponent } from './features/home/home.component';
import { RegistrationsComponent } from './features/registrations/registrations.component';
import { ReportsComponent } from './features/reports/reports.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'eventos', component: EventsComponent },
  { path: 'minhas-inscricoes', component: RegistrationsComponent, canActivate: [authGuard, participantGuard] },
  { path: 'certificados', component: CertificatesComponent, canActivate: [authGuard, participantGuard] },
  { path: 'painel', component: AdminDashboardComponent, canActivate: [authGuard, staffGuard] },
  { path: 'gerenciar-eventos', component: AdminEventsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'presencas', component: AttendanceComponent, canActivate: [authGuard, staffGuard] },
  { path: 'relatorios', component: ReportsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'auditoria', component: AuditComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'home' }
];
