# Eventus Plus

Sistema web para gestão de eventos, com login, perfis de acesso, inscrições, check-in, relatórios e auditoria.

## Stack

- Frontend: Angular
- Backend: Spring Boot com Java 17
- Banco de dados: MySQL 8
- Segurança: JWT, BCrypt, autorização por perfil, auditoria e variáveis de ambiente

## Requisitos

### Caminho recomendado

- Docker Desktop
- PowerShell, Terminal ou outro shell com Docker disponível

### Execução manual

- Java 17
- Maven 3.9+
- Node.js 20+
- MySQL 8

## Configuração do ambiente

1. Crie seu arquivo local de ambiente a partir do modelo:

```powershell
Copy-Item .env.example .env
```

ou

O projeto possui um setup Docker, com:

2. Ajuste os valores se necessário, principalmente:

- `JWT_SECRET`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- portas, caso alguma já esteja em uso

3. O arquivo `.env` fica fora do GitHub e deve permanecer local.

## Subir com Docker

Esse é o jeito mais rápido de rodar o projeto inteiro.

### Windows PowerShell

```powershell
.\run-local.ps1 -Build
```

Comandos úteis:

```powershell
.\run-local.ps1
.\run-local.ps1 -Build
.\run-local.ps1 -BackendOnly
.\run-local.ps1 -FrontendOnly
.\run-local.ps1 -DatabaseOnly
.\stop-local.ps1
.\stop-local.ps1 -RemoveVolumes
```

Após subir a stack completa, as URLs padrão ficam assim:

- Frontend: `http://localhost:4201`
- Backend: `http://localhost:8081`
- API: `http://localhost:8081/api`
- MySQL: `127.0.0.1:3307`

## Execução manual

Use esse caminho se quiser rodar frontend e backend fora do Docker.

### 1. Banco de dados

Você pode:

- subir apenas o MySQL pelo script:

```powershell
.\run-local.ps1 -DatabaseOnly
```

- ou usar uma instância própria de MySQL 8 e ajustar o `.env`

Valores padrão esperados pelo backend:

- host: `127.0.0.1`
- porta: `3307`
- banco: `eventus_plus`
- usuário: `eventus_app`

### 2. Backend

```powershell
cd backend
mvn spring-boot:run
```

URL padrão:

- Backend: `http://localhost:8081`

### 3. Frontend

```powershell
cd frontend
npm ci
npm start
```

URL padrão:

- Frontend: `http://localhost:4200`

No modo manual, o frontend usa `proxy.conf.json`, então as chamadas para `/api` são encaminhadas para `http://localhost:8081`.

## Usuários padrão

Quando o backend sobe com o banco vazio, ele cria automaticamente estes usuários bootstrap:

| Perfil        | Nome                  | E-mail                           | Senha                   |
| ------------- | --------------------- | -------------------------------- | ----------------------- |
| Administrador | `Administrador Local` | `admin@eventusplus.local`        | `change_me_admin`       |
| Operador      | `Operador Local`      | `operador@eventusplus.local`     | `change_me_operator`    |
| Participante  | `Participante Local`  | `participante@eventusplus.local` | `change_me_participant` |

Esses valores vêm do `.env` e podem ser alterados antes da primeira subida.

### Importante sobre bootstrap

Os usuários bootstrap são criados somente se ainda não existirem no banco.

Se você mudar os e-mails ou senhas no `.env` depois que o banco já foi criado, os usuários antigos continuam no banco. Para recriar tudo do zero:

```powershell
.\stop-local.ps1 -RemoveVolumes
.\run-local.ps1 -Build
```

ou

```bash
docker compose down -v
docker compose up -d --build
```

## Perfis de acesso

- `PARTICIPANT`: agenda, inscrições, certificados e ações do próprio usuário
- `OPERATOR`: fila de check-in e operação de presenças
- `ADMIN`: gestão de eventos, usuários, relatórios e auditoria

## Comandos de validação

### Backend

```powershell
cd backend
mvn test
```

### Frontend

```powershell
cd frontend
npm run build
```

## Estrutura principal

- `frontend/`: aplicação Angular
- `backend/`: API Spring Boot
- `compose.yaml`: stack local
- `compose.prod.yaml`: stack de produção com imagens prontas
- `.env.example`: modelo de configuração local
- `.env.prod.example`: modelo de configuração de produção

## Entrega

O projeto cobre os pontos principais da entrega:

- sistema executável localmente
- login funcionando
- usuários de teste
- três perfis de acesso
- CRUD principal
- persistência em banco
- senhas com hash
- autorização por perfil
- exemplo de bloqueio por falta de permissão
- auditoria
- `.env.example`
- `.env` fora do Git
- README com instruções de execução
