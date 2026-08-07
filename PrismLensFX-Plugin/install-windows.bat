@echo off
:: Prism Lens FX – Windows CEP Extension Installer

set DEST=%APPDATA%\Adobe\CEP\extensions\com.touriststudios.prismlensfx
set SRC=%~dp0

echo Installing Prism Lens FX panel...
echo   Dest: %DEST%

if not exist "%DEST%" mkdir "%DEST%"
xcopy /E /I /Y "%SRC%" "%DEST%"

:: Enable unsigned CEP extensions
reg add "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

echo.
echo Done! Restart Premiere Pro, then open: Window ^> Extensions ^> Prism Lens FX
pause
