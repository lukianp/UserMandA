@echo off
echo Enterprise Discovery Suite - Demo Version
echo =========================================
echo.
echo Starting demo application...
echo.
echo Note: This demo loads ljops data from C:\DiscoveryData\ljpops\Raw
echo and provides interactive discovery modules with dummy data.
echo.
npx electron .\.webpack\main\main.js
pause