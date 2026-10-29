@echo off
REM ============================================================================
REM Batch script to run all Monthly Batch Process related migrations
REM Run this as Administrator if you have permission issues
REM ============================================================================

echo Running Monthly Batch Process migrations...
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: MySQL client not found in PATH
    echo Please ensure MySQL is installed and added to your PATH
    pause
    exit /b 1
)

REM Prompt for database credentials
set /p db_user=Enter MySQL username (default: root): 
if "%db_user%"=="" set db_user=root

set /p db_name=Enter database name: 
if "%db_name%"=="" (
    echo ERROR: Database name is required
    pause
    exit /b 1
)

set /p db_pass=Enter MySQL password for %db_user%: 

REM Run migrations in order
set migrations=071_comprehensive_archive_tables 072_batch_process_config 073_sales_order_blocking 074_materials_closing_balance_date

for %%m in (%migrations%) do (
    echo Running migration: 071_%%m.sql...
    mysql -u %db_user% -p%db_pass% %db_name% < server\sql\migrations\%%m.sql
    
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Migration %%m failed!
        pause
        exit /b 1
    )
    
    echo Migration %%m completed successfully.
    echo.
)

echo.
echo ============================================================================
echo ALL MIGRATIONS COMPLETED SUCCESSFULLY!
echo ============================================================================
echo.
echo Verification:
echo 1. Archive tables should now exist
mysql -u %db_user% -p%db_pass% %db_name% -e "SHOW TABLES LIKE '%%archive%%'"

echo.
echo 2. Check new columns in materials table
mysql -u %db_user% -p%db_pass% %db_name% -e "DESCRIBE materials" | findstr "closing_balance"

echo.
echo 3. Check sales_orders has blocking columns
mysql -u %db_user% -p%db_pass% %db_name% -e "DESCRIBE sales_orders" | findstr "is_blocked"

echo.
echo 4. Check batch_process_config table exists
mysql -u %db_user% -p%db_pass% %db_name% -e "SHOW TABLES LIKE 'batch_process_config'"

pause
