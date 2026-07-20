# PowerShell script to run database migrations for Tannery Mini ERP
# Run this from PowerShell (not cmd)

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$dbUser = "root"
$dbPass = "Shoe@123"
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "tannery_mini_erp"

Write-Host "Running database migrations..." -ForegroundColor Cyan

# Migration 007 - Main schema for all new tables
Write-Host "Running migration 007..." -ForegroundColor Yellow
& $mysqlPath -u $dbUser -p$dbPass -h $dbHost -P $dbPort $dbName < server\sql\migrations\007_new_modules_batch_pricing_stock.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration 007 failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Migration 007 completed successfully!" -ForegroundColor Green

# Migration 008 - Seed data (optional)
Write-Host "Running migration 008 (seed data)..." -ForegroundColor Yellow
& $mysqlPath -u $dbUser -p$dbPass -h $dbHost -P $dbPort $dbName < server\sql\migrations\008_seed_new_modules.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Migration 008 failed!" -ForegroundColor Yellow
    Write-Host "This is optional seed data, so the application may still work." -ForegroundColor Yellow
} else {
    Write-Host "Migration 008 completed successfully!" -ForegroundColor Green
}

Write-Host "" -ForegroundColor Cyan
Write-Host "All database migrations completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "The following tables should now exist:" -ForegroundColor Cyan
Write-Host "  - batches" -ForegroundColor White
Write-Host "  - batch_line_items" -ForegroundColor White
Write-Host "  - supplier_pricing (enhanced)" -ForegroundColor White
Write-Host "  - price_breaks" -ForegroundColor White
Write-Host "  - price_change_history" -ForegroundColor White
Write-Host "  - supplier_pricing_attachments" -ForegroundColor White
Write-Host "  - price_approval_requests" -ForegroundColor White
Write-Host "  - price_approval_items" -ForegroundColor White
Write-Host "  - price_approval_workflow" -ForegroundColor White
Write-Host "  - physical_stock_entries" -ForegroundColor White
Write-Host "  - physical_stock_entry_items" -ForegroundColor White
