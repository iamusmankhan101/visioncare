@echo off
echo 🚀 Starting Push Notification Test Server...
echo.

cd server
echo Current directory: %CD%
echo.

echo Starting server on port 5004...
node testServer.js

pause