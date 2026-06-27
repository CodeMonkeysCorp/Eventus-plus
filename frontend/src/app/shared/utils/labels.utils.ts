import { EventStatus, RegistrationStatus, UserRole } from '../../core/models';

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'OPERATOR':
      return 'Operador';
    case 'PARTICIPANT':
      return 'Participante';
  }
}

export function eventStatusLabel(status: EventStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Rascunho';
    case 'PUBLISHED':
      return 'Publicado';
    case 'CLOSED':
      return 'Encerrado';
  }
}

export function registrationStatusLabel(status: RegistrationStatus): string {
  switch (status) {
    case 'REGISTERED':
      return 'Inscrito';
    case 'CHECKED_IN':
      return 'Presente';
  }
}

export function auditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    REGISTER: 'Cadastro',
    LOGIN_SUCCESS: 'Login ok',
    LOGIN_FAILURE: 'Login falhou',
    USER_CREATED: 'Usuário criado',
    USER_UPDATED: 'Usuário atualizado',
    USER_STATUS_UPDATED: 'Status de usuário',
    EVENT_CREATED: 'Evento criado',
    EVENT_UPDATED: 'Evento atualizado',
    EVENT_DELETED: 'Evento removido',
    REGISTRATION_CREATED: 'Inscrição criada',
    CHECK_IN_CONFIRMED: 'Check-in confirmado',
    AUTHENTICATION_REQUIRED: 'Sem autenticação',
    ACCESS_DENIED: 'Acesso negado'
  };

  return labels[action] ?? action;
}
