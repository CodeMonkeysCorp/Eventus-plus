param(
    [string]$ComposeFile = "compose.prod.yaml",
    [string]$EnvFile = ".env.prod"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ComposeFile)) {
    throw "Arquivo $ComposeFile não encontrado."
}

if (-not (Test-Path $EnvFile)) {
    throw "Arquivo $EnvFile não encontrado."
}

docker compose --env-file $EnvFile -f $ComposeFile pull
docker compose --env-file $EnvFile -f $ComposeFile up -d
docker compose --env-file $EnvFile -f $ComposeFile ps
