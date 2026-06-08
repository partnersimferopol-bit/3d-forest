# Проверка файлов перед выкладкой на GitHub Pages
$root = Resolve-Path (Join-Path $PSScriptRoot '..')

$required = @(
  'index.html',
  'css\styles.css',
  'js\app.js',
  'js\data.js',
  'js\icons.js',
  'js\config-overrides.js',
  'assets\images\hero-cover.jpg',
  'assets\bg-wood-leaves.png'
)

Write-Host "Check: $root"
$ok = $true
foreach ($rel in $required) {
  $path = Join-Path $root $rel
  if (Test-Path $path) {
    Write-Host "  OK  $rel"
  } else {
    Write-Host "  MISSING $rel" -ForegroundColor Red
    $ok = $false
  }
}

$iconCount = (Get-ChildItem (Join-Path $root 'assets\icons') -ErrorAction SilentlyContinue | Measure-Object).Count
$resultCount = (Get-ChildItem (Join-Path $root 'assets\images\results') -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "  icons: $iconCount файлов"
Write-Host "  results: $resultCount файлов"

if (-not $ok) {
  Write-Host "`nRequired files missing." -ForegroundColor Red
  exit 1
}
Write-Host "`nReady to push to GitHub." -ForegroundColor Green
