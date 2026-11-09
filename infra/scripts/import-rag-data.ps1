param(
  [Parameter(Mandatory = $true)]
  [string]$ArchivePath,
  [switch]$ResetRagData
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$archive = Resolve-Path $ArchivePath -ErrorAction Stop

if (-not $ResetRagData) {
  throw "Lệnh này cần -ResetRagData vì sẽ thay toàn bộ dữ liệu RAG local hiện có."
}

Push-Location $projectRoot
try {
  # Only the local RAG Docker volume is deleted. Supabase is not touched.
  docker compose down -v
  docker compose up -d backend
  $containerId = (docker compose ps -q backend).Trim()
  if (-not $containerId) {
    throw "Không tìm thấy container backend để nhập dữ liệu RAG."
  }

  $archiveInContainer = "/tmp/eventhhd-rag-data.tar.gz"
  docker cp $archive.Path "${containerId}:$archiveInContainer"
  docker compose exec -T backend tar -xzf $archiveInContainer -C /app/data
  docker compose exec -T backend rm -f $archiveInContainer
  docker compose up -d

  Write-Host "Đã nhập dữ liệu RAG và khởi động ứng dụng." -ForegroundColor Green
}
finally {
  Pop-Location
}
