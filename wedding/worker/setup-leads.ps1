# Настройка заявок + ВК через терминал (Windows PowerShell)
# Запуск из папки worker:  .\setup-leads.ps1

$ErrorActionPreference = "Stop"
$WorkerDir = $PSScriptRoot
$ProjectRoot = Split-Path $WorkerDir -Parent

Write-Host "=== Подарок из Будущего — настройка API заявок ===" -ForegroundColor Cyan

if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
  Write-Host "Wrangler не найден. Установите:" -ForegroundColor Yellow
  Write-Host "  npm install -g wrangler"
  Write-Host "  wrangler login"
  exit 1
}

Set-Location $WorkerDir

Write-Host "`n1) Вход в Cloudflare (если ещё не входили)..." -ForegroundColor Green
wrangler login

Write-Host "`n2) KV-хранилище заявок..." -ForegroundColor Green
$toml = Get-Content "wrangler.toml" -Raw
if ($toml -match 'id = "PASTE_KV') {
  Write-Host "Создаём namespace LEADS..."
  $out = wrangler kv namespace create LEADS 2>&1 | Out-String
  Write-Host $out
  if ($out -match 'id = "([a-f0-9]+)"') {
    $kvId = $Matches[1]
    $toml = $toml -replace 'id = "PASTE_KV_NAMESPACE_ID_AFTER_CREATE"', "id = `"$kvId`""
    Set-Content "wrangler.toml" $toml -NoNewline
    Write-Host "wrangler.toml обновлён (KV id)." -ForegroundColor Green
  } else {
    Write-Host "Скопируйте id в wrangler.toml вручную и запустите скрипт снова." -ForegroundColor Yellow
    exit 1
  }
}

Write-Host "`n3) Секреты (ввод с клавиатуры, не отображаются в истории файлов)..." -ForegroundColor Green
Write-Host "   VK_GROUP_TOKEN — новый ключ API сообщества (НЕ из чата!)" -ForegroundColor Yellow
wrangler secret put VK_GROUP_TOKEN
Write-Host "   VK_NOTIFY_PEER_ID — для беседы convo/-202321163 обычно: 2202321163" -ForegroundColor Yellow
wrangler secret put VK_NOTIFY_PEER_ID
Write-Host "   ADMIN_SECRET — пароль для админки (заявки)" -ForegroundColor Yellow
wrangler secret put ADMIN_SECRET

Write-Host "`n4) Деплой Worker..." -ForegroundColor Green
$deployOut = wrangler deploy 2>&1 | Out-String
Write-Host $deployOut
if ($deployOut -match '(https://[a-zA-Z0-9.-]+\.workers\.dev)') {
  $workerUrl = $Matches[1]
} else {
  $workerUrl = Read-Host "Вставьте URL Worker из вывода выше (https://....workers.dev)"
}

Write-Host "`n5) Проверка /health ..." -ForegroundColor Green
try {
  $health = Invoke-RestMethod -Uri "$workerUrl/health" -Method Get
  $health | ConvertTo-Json
} catch {
  Write-Host "Health check failed: $_" -ForegroundColor Red
}

Write-Host "`n6) config-leads.js (только URL, без токена ВК)..." -ForegroundColor Green
$configPath = Join-Path $ProjectRoot "js\config-leads.js"
$adminSecretNote = "сохраните в admin.html -> Заявки (не коммитьте в GitHub)"
$config = @"
/**
 * URL API заявок (после setup-leads.ps1)
 * Токен ВК только в Cloudflare Secrets!
 * adminSecret — только в admin.html, не в этом файле.
 */
const LEADS_API = {
  baseUrl: '$workerUrl',
  adminSecret: '',
};
"@
Set-Content $configPath $config -Encoding UTF8
Write-Host "Записано: $configPath" -ForegroundColor Green

Write-Host "`n=== Готово ===" -ForegroundColor Cyan
Write-Host "Worker URL: $workerUrl"
Write-Host "Дальше:"
Write-Host "  - git add js/config-leads.js && git commit && git push  (только baseUrl)"
Write-Host "  - admin.html -> Заявки -> URL + ADMIN_SECRET -> Сохранить"
Write-Host "  - Тестовая заявка на сайте -> сообщение в беседе ВК"
Write-Host "ADMIN_SECRET: $adminSecretNote"
