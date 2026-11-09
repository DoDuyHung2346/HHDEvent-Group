param(
  [string]$OutputPath = (Join-Path $PSScriptRoot "..\..\eventhhd-rag-data.tar.gz")
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$outputDirectory = Split-Path -Parent $OutputPath

if ($outputDirectory) {
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

Push-Location $projectRoot
try {
  # Make sure the named RAG volume is mounted before creating the archive.
  docker compose up -d backend
  $containerId = (docker compose ps -q backend).Trim()
  if (-not $containerId) {
    throw "Không tìm thấy container backend để xuất dữ liệu RAG."
  }

  $archiveInContainer = "/tmp/eventhhd-rag-data.tar.gz"
  docker compose exec -T backend tar -czf $archiveInContainer -C /app/data .
  docker cp "${containerId}:$archiveInContainer" $OutputPath
  docker compose exec -T backend rm -f $archiveInContainer

  Write-Host "Đã xuất dữ liệu RAG: $OutputPath" -ForegroundColor Green
}
finally {
  Pop-Location
}
