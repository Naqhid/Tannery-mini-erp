<#
.SYNOPSIS
    Runs all Monthly Batch Process related database migrations.
.DESCRIPTION
    This script executes migrations 071-074 in order to set up the Monthly Batch Process.
    Migrations include:
    - 071: Comprehensive archive tables
    - 072: Batch process config tracking
    - 073: Sales order blocking
    - 074: Materials closing balance date tracking

.NOTES
    File Name      : run_migrations.ps1
    Author         : Mistral Vibe
    Prerequisite   : MySQL server running, MySQL client installed
#>

#Requires -RunAsAdministrator

param (
    [string]$DbUser = "root",
    [string]$DbName,
    [string]$DbPass
)

# Check if MySQL is available
try {
    $mysqlVersion = mysql --version
    Write-Host "MySQL Client Version: $mysqlVersion"
} catch {
    Write-Host "ERROR: MySQL client not found. Please install MySQL and ensure it's in your PATH." -ForegroundColor Red
    exit 1
}

# Validate database name
if ([string]::IsNullOrEmpty($DbName)) {
    $DbName = Read-Host "Enter database name"
    if ([string]::IsNullOrEmpty($DbName)) {
        Write-Host "ERROR: Database name is required." -ForegroundColor Red
        exit 1
    }
}

# Validate password
if ([string]::IsNullOrEmpty($DbPass)) {
    $DbPass = Read-Host "Enter MySQL password for $DbUser" -AsSecureString
    $DbPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPass)
    )
}

# Migration files to run
$migrations = @(
    "071_comprehensive_archive_tables",
    "072_batch_process_config",
    "073_sales_order_blocking",
    "074_materials_closing_balance_date"
)

$scriptPath = $PSScriptRoot
$migrationsPath = Join-Path -Path $scriptPath -ChildPath "server\sql\migrations"

Write-Host "Running Monthly Batch Process migrations..." -ForegroundColor Cyan
Write-Host "Database: $DbName" -ForegroundColor Cyan
Write-Host "User: $DbUser" -ForegroundColor Cyan
Write-Host ""

foreach ($migration in $migrations) {
    $migrationFile = Join-Path -Path $migrationsPath -ChildPath "$migration.sql"
    
    if (-not (Test-Path -Path $migrationFile)) {
        Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Running migration: $migration..." -ForegroundColor Yellow
    
    $mysqlArgs = @(
        "-u", $DbUser,
        "-p$DbPass",
        $DbName
    )
    
    try {
        # Run the migration
        $result = mysql $mysqlArgs < $migrationFile
        Write-Host "Migration $migration completed successfully." -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "ERROR: Migration $migration failed!" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "ALL MIGRATIONS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Verification
Write-Host "Running verification checks..." -ForegroundColor Yellow
Write-Host ""

# Check archive tables
Write-Host "1. Archive tables:" -ForegroundColor Cyan
try {
    $archiveTables = mysql $mysqlArgs -e "SHOW TABLES LIKE '%archive%'"
    $archiveTables | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
} catch {
    Write-Host "   No archive tables found" -ForegroundColor Yellow
}

Write-Host ""

# Check materials table new columns
Write-Host "2. Materials table - new columns:" -ForegroundColor Cyan
try {
    $columns = mysql $mysqlArgs -e "DESCRIBE materials" | Select-String "closing_balance"
    if ($columns) {
        $columns | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
    } else {
        Write-Host "   No closing_balance columns found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error checking materials table: $_" -ForegroundColor Red
}

Write-Host ""

# Check sales_orders blocking columns
Write-Host "3. Sales Orders table - blocking columns:" -ForegroundColor Cyan
try {
    $columns = mysql $mysqlArgs -e "DESCRIBE sales_orders" | Select-String "is_blocked"
    if ($columns) {
        $columns | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
    } else {
        Write-Host "   No blocking columns found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error checking sales_orders table: $_" -ForegroundColor Red
}

Write-Host ""

# Check batch_process_config table
Write-Host "4. Batch process config table:" -ForegroundColor Cyan
try {
    $tables = mysql $mysqlArgs -e "SHOW TABLES LIKE 'batch_process_config'"
    if ($tables) {
        $tables | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
    } else {
        Write-Host "   batch_process_config table not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error checking batch_process_config table: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Migration script completed." -ForegroundColor Green
