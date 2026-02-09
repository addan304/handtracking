@echo off
setlocal
cd /d "%~dp0"

echo [1/2] Starting Development Server...
start "Valentine Server" cmd /c "npm run dev"

echo Waiting for server to initialize...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Ngrok Tunnel...
:: Try global ngrok first, then npx ngrok as fallback (with -y to avoid prompt)
start "Ngrok Tunnel" powershell -NoExit -Command "try { if (Get-Command ngrok -ErrorAction SilentlyContinue) { ngrok http --domain=atavistically-pseudoinsane-raquel.ngrok-free.dev 5173 } else { npx -y ngrok http --domain=atavistically-pseudoinsane-raquel.ngrok-free.dev 5173 } } catch { Write-Host 'Failed to start ngrok' -ForegroundColor Red }"

echo.
echo ==========================================
echo   Application is starting!
echo ==========================================
echo Local: http://localhost:5173
echo Public: https://atavistically-pseudoinsane-raquel.ngrok-free.dev
echo.
echo Keep the new windows open while using the app.
echo Run stop.bat to close everything.
echo.
pause
