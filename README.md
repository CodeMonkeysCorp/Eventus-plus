# Eventus Plus

Sistema web para gerenciamento de eventos academicos ficticios, com inscricao,
check-in, certificados ficticios e logs de auditoria.

## Projeto

- Codigo do projeto: `P09-A`
- Tema: `Eventos: inscricao e presenca`
- Repositorio: `https://github.com/CodeMonkeysCorp/eventus-plus`

## Integrantes

- Jose Henrique Bruhmuller
- Matheus Busemayer
- Andre Schultz
- Lucas Monich Nunes

## Stack prevista

- Frontend: Angular
- Backend: Spring Boot com Java 17
- Banco de dados: MySQL
- Controle de versao: GitHub
- Seguranca: autenticacao com login e senha, hash de senha, autorizacao por
  perfil, validacao no back-end, protecao de variaveis de ambiente e logs de
  auditoria

## Perfis de usuario

- Participante: cria conta, visualiza eventos, realiza inscricoes, consulta as
  proprias inscricoes, verifica presenca e acessa certificados ficticios quando
  aplicavel
- Operador: acompanha inscricoes, realiza check-in, valida presenca e atualiza
  status de participacao em eventos
- Administrador: gerencia eventos, usuarios, perfis, inscricoes, relatorios e
  logs de auditoria

## Funcionalidades minimas previstas

- Cadastro e autenticacao de usuarios
- Controle de acesso por perfil
- CRUD de eventos
- Inscricao de participantes em eventos
- Consulta das proprias inscricoes pelo participante
- Check-in de presenca por operador ou administrador
- Registro de certificado ficticio para participantes presentes
- Consulta administrativa de inscricoes e presencas
- Geracao de relatorios de eventos, inscricoes e presenca
- Logs de auditoria para login, criacao e edicao de eventos, inscricao,
  check-in, acoes administrativas e tentativas de acesso negado
- Validacao dos dados no back-end
- Uso de `.env.example` e protecao de credenciais fora do GitHub

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
