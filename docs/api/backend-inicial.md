# Backend Inicial - Eventus+

## Base URL

- `http://localhost:8080/api`

## Autenticação

- `POST /auth/register`: cria conta de participante e devolve JWT.
- `POST /auth/login`: autentica usuário e devolve JWT.
- `GET /auth/me`: retorna o usuário autenticado.

## Eventos

- `GET /events`: lista eventos publicados.
- `GET /events/{id}`: detalha um evento publicado.
- `GET /events/admin`: lista todos os eventos para administração.
- `POST /events`: cria evento. Requer `ADMIN`.
- `PUT /events/{id}`: atualiza evento. Requer `ADMIN`.
- `DELETE /events/{id}`: remove evento. Requer `ADMIN`.

## Inscrições e Presença

- `POST /registrations/events/{eventId}`: participante se inscreve em evento publicado.
- `GET /registrations/me`: lista inscrições do participante autenticado.
- `GET /registrations/admin`: lista inscrições para `ADMIN` e `OPERATOR`.
- `POST /attendance/registrations/{registrationId}/check-in`: confirma presença. Requer `ADMIN` ou `OPERATOR`.

## Certificados e Relatórios

- `GET /certificates/me`: lista certificados fictícios liberados por check-in.
- `GET /reports/events/{eventId}/summary`: resumo administrativo de vagas, inscrições e check-ins. Requer `ADMIN`.
- `GET /audit/logs?limit=50`: consulta logs de auditoria. Requer `ADMIN`.

## Header de Autorização

- `Authorization: Bearer <jwt>`
