@echo off
echo ====================================
echo BMS3 Database Setup
echo ====================================
echo.
echo This script will create the BMS3 database and tables.
echo.
set /p password="Enter your MySQL root password: "
echo.
echo Creating database...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p%password% < database.sql
echo.
if %errorlevel% equ 0 (
    echo ✓ Database created successfully!
) else (
    echo ✗ Error creating database. Please check your password and try again.
)
echo.
pause
