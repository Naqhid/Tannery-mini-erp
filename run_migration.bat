@echo off
set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
set DB_USER=root
set DB_PASS=Shoe@123
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=tannery_mini_erp

%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% -h %DB_HOST% -P %DB_PORT% %DB_NAME% < server\sql\migrations\007_new_modules_batch_pricing_stock.sql
pause
