@echo off
title Cloudflare Quick Tunnel Launcher
color 0B
cls

echo ========================================================
echo           CLOUDFLARE QUICK TUNNEL LAUNCHER
echo ========================================================
echo.

:: 1. Tu dong tim cloudflared (PATH he thong hoac thu muc Downloads)
set "CLOUDFLARED_CMD=cloudflared"

where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%USERPROFILE%\Downloads\cloudflare\cloudflared.exe" (
        set "CLOUDFLARED_CMD=%USERPROFILE%\Downloads\cloudflare\cloudflared.exe"
    ) else if exist "C:\Users\Admin\Downloads\cloudflare\cloudflared.exe" (
        set "CLOUDFLARED_CMD=C:\Users\Admin\Downloads\cloudflare\cloudflared.exe"
    ) else if exist "%~dp0cloudflared.exe" (
        set "CLOUDFLARED_CMD=%~dp0cloudflared.exe"
    ) else (
        echo [ERROR] Khong tim thay 'cloudflared' tren may!
        echo Vui long kiem tra file: C:\Users\Admin\Downloads\cloudflare\cloudflared.exe
        echo.
        pause
        exit /b 1
    )
)

:: 2. Nhap Port local (mac dinh la 3000 neu an Enter)
set /p PORT="Nhap Local Port muon public (Mac dinh 3000): "
if "%PORT%"=="" set PORT=3000

echo.
echo [*] Dang khoi tao tunnel den http://localhost:%PORT% ...
echo [*] Cho vai giay de Cloudflare cap URL (https://...trycloudflare.com)
echo [*] Copy link do gui cho nguoi khac de ho truy cap vao may ban!
echo [*] Nhan Ctrl + C (hoac dong cua so) de tat tunnel khi xong.
echo --------------------------------------------------------
echo.

:: 3. Chay Quick Tunnel
"%CLOUDFLARED_CMD%" tunnel --url http://localhost:%PORT%

pause
