# Eventus Plus

Sistema web para gestao de eventos academicos ficticios, com inscricao, check-in,
certificados ficticios e logs de auditoria.

## Stack prevista

- Frontend: Angular
- Backend: Spring Boot com Java 17
- Banco de dados: MySQL

## Estrutura inicial

```text
backend/
  src/
    main/
      java/com/eventusplus/
        audit/
        attendance/
        certificate/
        common/
        config/
        event/
        registration/
        report/
        security/
        user/
      resources/
        db/migration/
    test/
      java/com/eventusplus/
frontend/
  src/
    app/
      core/
      features/
      shared/
    assets/
    environments/
docs/
  api/
  checkpoints/
  diagramas/
  evidencias/
  modelagem/
  relatorio-tecnico/
  seguranca/
scripts/
```

## Proximos passos

1. Inicializar o Angular dentro de `frontend`.
2. Inicializar o Spring Boot dentro de `backend`.
3. Definir matriz de permissoes, entidades e endpoints.
4. Usar `docs/` para checkpoints, evidencias e relatorio tecnico.
