# Automated timestamped backup of the bms3_db MySQL database.
# Usage:  powershell -File scripts/backup-db.ps1
# Schedule it with Windows Task Scheduler for automated snapshots.

$ErrorActionPreference = 'Stop'

$DbName     = 'bms3_db'
$DbUser     = 'root'
$BackupDir  = Join-Path $PSScriptRoot '..\backups'
$MysqlDump  = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe'

# Read the password from .env so it is never hard-coded here
$envFile = Join-Path $PSScriptRoot '..\.env'
$DbPassword = (Get-Content $envFile | Where-Object { $_ -match '^DB_PASSWORD=(.*)$' }) -replace '^DB_PASSWORD=', ''
if (-not $DbPassword) { throw 'DB_PASSWORD not found in backend\.env' }

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$outFile   = Join-Path $BackupDir "$DbName`_$timestamp.sql"

& $MysqlDump -u $DbUser "-p$DbPassword" --routines --triggers --single-transaction $DbName | Out-File -Encoding utf8 $outFile

if ($LASTEXITCODE -ne 0) { throw "mysqldump failed with exit code $LASTEXITCODE" }

$sizeKb = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
Write-Host "Backup created: $outFile ($sizeKb KB)"

# Retention: delete backups older than 30 days
$cutoff = (Get-Date).AddDays(-30)
Get-ChildItem $BackupDir -Filter "$DbName`_*.sql" |
  Where-Object { $_.LastWriteTime -lt $cutoff } |
  ForEach-Object { Remove-Item $_.FullName -Force; Write-Host "Pruned old backup: $($_.Name)" }
