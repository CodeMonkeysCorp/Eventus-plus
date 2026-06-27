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

## Usuários de Demonstração

Quando a stack local é iniciada com `compose.yaml`, o backend cria estes
usuários automaticamente se eles ainda não existirem no banco:

- Administrador: `admin@eventusplus.local` / `change_me_admin`
- Operador: `operador@eventusplus.local` / `change_me_operator`
- Participante: `participante@eventusplus.local` / `change_me_participant`

Os valores podem ser alterados no arquivo `.env` a partir do modelo
`.env.example`.

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

Após subir a stack completa, as URLs padrão ficam assim:

- Frontend: `http://localhost:4201`
- Backend: `http://localhost:8081`
- API: `http://localhost:8081/api`

## Fluxo de Demonstração

Sugestão de roteiro para a entrega obrigatória:

1. Subir a stack com `.\run-local.ps1 -Build`.
2. Entrar com o usuário administrador e criar/editar/remover um evento no
   CRUD principal.
3. Entrar com o participante e fazer uma inscrição.
4. Entrar com o operador e confirmar o check-in da inscrição.
5. Mostrar que o participante não consegue acessar o gerenciamento de eventos
   e recebe bloqueio por permissão.
6. Voltar ao administrador e abrir a tela de auditoria para exibir logs de
   cadastro, login, CRUD, inscrição, check-in e acesso negado.

## Segurança Implementada

- Autenticação com JWT e login por email/senha
- Senhas armazenadas com hash BCrypt
- Perfis `ADMIN`, `OPERATOR` e `PARTICIPANT`
- Autorização no backend com `@PreAuthorize` e no frontend com guards
- Persistência MySQL com migração versionada via Flyway
- Logs de auditoria para cadastro, login, CRUD de eventos, inscrição, check-in
  e tentativas de acesso negado
