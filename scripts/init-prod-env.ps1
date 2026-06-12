param(
    [string]$OutputPath = ".env.prod",
    [string]$BackendImage = "eventus-plus-backend:ci",
    [string]$FrontendImage = "eventus-plus-frontend:ci",
    [string]$AdminEmail = "admin@eventusplus.local",
    [string]$AdminName = "Administrador",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

if ((Test-Path $OutputPath) -and -not $Force) {
    throw "Arquivo $OutputPath ja existe. Use -Force para recriar."
}

function New-HexSecret {
    param([int]$ByteCount = 32)

    $bytes = New-Object byte[] $ByteCount
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        return -join ($bytes | ForEach-Object { $_.ToString("x2") })
    }
    finally {
        $rng.Dispose()
    }
}

$mysqlPassword = New-HexSecret 24
$mysqlRootPassword = New-HexSecret 24
$jwtSecret = New-HexSecret 48
$adminPassword = New-HexSecret 18

$content = @"
# Production Compose
FRONTEND_PORT=80
MYSQL_DATABASE=eventus_plus
MYSQL_USER=eventus_app
MYSQL_PASSWORD=$mysqlPassword
MYSQL_ROOT_PASSWORD=$mysqlRootPassword

# Images published by CD
BACKEND_IMAGE=$BackendImage
FRONTEND_IMAGE=$FrontendImage

# Backend / Spring Boot
JWT_SECRET=$jwtSecret
JWT_EXPIRATION_MS=3600000
ADMIN_NAME=$AdminName
ADMIN_EMAIL=$AdminEmail
ADMIN_PASSWORD=$adminPassword
CORS_ALLOWED_ORIGINS=https://seu-dominio.com
LOG_LEVEL=INFO
"@

Set-Content -LiteralPath $OutputPath -Value $content -Encoding UTF8

Write-Host "Arquivo $OutputPath criado com segredos fortes."
Write-Host "Guarde a senha inicial do admin em um cofre antes do primeiro deploy."
