# Eventus Plus

Sistema web para gerenciamento de eventos acadêmicos fictícios, com inscrição,
check-in, certificados fictícios e logs de auditoria.

## Projeto

- Código do projeto: `P09-A`
- Tema: `Eventos: inscrição e presença`
- Repositório: `https://github.com/CodeMonkeysCorp/eventus-plus`

## Integrantes

- Jose Henrique Bruhmuller
- Matheus Busemayer
- Andre Schultz
- Lucas Monich Nunes

## Stack Prevista

- Frontend: Angular
- Backend: Spring Boot com Java 17
- Banco de dados: MySQL
- Controle de versão: GitHub
- Segurança: autenticação com login e senha, hash de senha, autorização por
  perfil, validação no back-end, proteção de variáveis de ambiente e logs de
  auditoria

## Perfis de Usuário

- Participante: cria conta, visualiza eventos, realiza inscrições, consulta as
  próprias inscrições, verifica presença e acessa certificados fictícios quando
  aplicável
- Operador: acompanha inscrições, realiza check-in, valida presença e atualiza
  status de participação em eventos
- Administrador: gerencia eventos, usuários, perfis, inscrições, relatórios e
  logs de auditoria

## Funcionalidades Mínimas Previstas

- Cadastro e autenticação de usuários
- Controle de acesso por perfil
- CRUD de eventos
- Inscrição de participantes em eventos
- Consulta das próprias inscrições pelo participante
- Check-in de presença por operador ou administrador
- Registro de certificado fictício para participantes presentes
- Consulta administrativa de inscrições e presenças
- Geração de relatórios de eventos, inscrições e presença
- Logs de auditoria para login, criação e edição de eventos, inscrição,
  check-in, ações administrativas e tentativas de acesso negado
- Validação dos dados no back-end
- Uso de `.env.example` e proteção de credenciais fora do GitHub

## Estrutura Inicial

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

## Docker Local

O projeto agora possui o mesmo setup Docker do `Reserva-plus`, com:

- `compose.yaml` para desenvolvimento local
- `compose.prod.yaml` para deploy com imagens prontas
- `run-local.ps1` e `stop-local.ps1` para subir e derrubar a stack no Windows
- `scripts/init-prod-env.{ps1,sh}` para gerar `.env.prod`
- `scripts/deploy-prod.{ps1,sh}` para subir a stack de produção

### Comandos principais

```powershell
.\run-local.ps1
.\run-local.ps1 -Build
.\run-local.ps1 -BackendOnly
.\run-local.ps1 -DatabaseOnly
.\stop-local.ps1
```

No desenvolvimento local, o `eventus-plus` possui seu próprio MySQL no
`compose.yaml`, publicado por padrão na porta `3307`. Assim ele fica isolado
do `reserva-plus`, que pode continuar usando a porta `3306`.

## Diretriz de Texto

O projeto passa a adotar **UTF-8** como padrão para arquivos de texto e
acentuação normal em conteúdos em português. A diretriz completa está em
[docs/diretrizes-utf8.md](docs/diretrizes-utf8.md).

## Próximos Passos

1. Evoluir as telas do frontend com mais refinamento de UX.
2. Integrar frontend e backend usando os endpoints já disponíveis.
3. Definir matriz de permissões, entidades e endpoints complementares.
4. Usar `docs/` para checkpoints, evidências e relatório técnico.
