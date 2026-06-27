export type UserRole = 'PARTICIPANT' | 'OPERATOR' | 'ADMIN';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type RegistrationStatus = 'REGISTERED' | 'CHECKED_IN';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface UserCreatePayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdatePayload {
  fullName: string;
  email: string;
  password?: string | null;
  role: UserRole;
}

export interface UserStatusPayload {
  active: boolean;
}

export interface AuthSession {
  token: string;
  user: UserResponse;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registeredCount: number;
  availableSpots: number;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPayload {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: EventStatus;
}

export interface RegistrationResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  participantId: number;
  participantName: string;
  participantEmail: string;
  status: RegistrationStatus;
  registeredAt: string;
  checkedInAt: string | null;
  certificateIssuedAt: string | null;
  checkedInBy: string | null;
}

export interface CertificateResponse {
  registrationId: number;
  eventId: number;
  eventTitle: string;
  issuedAt: string | null;
}

export interface AuditLogResponse {
  id: number;
  action: string;
  targetType: string;
  targetId: string | null;
  actorEmail: string | null;
  details: string | null;
  ipAddress: string | null;
  occurredAt: string;
}

export interface EventSummaryResponse {
  eventId: number;
  title: string;
  status: EventStatus;
  capacity: number;
  registrations: number;
  checkIns: number;
  remainingSpots: number;
  occupancyRate: number;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
