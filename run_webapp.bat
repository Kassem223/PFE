@echo off
echo Starting the Web Application...

echo Starting Backend Server in a new window...
start cmd /k "cd backend && npm install && npm run dev"

echo Starting Frontend Server in a new window...
start cmd /k "cd frontend && npm install && npm run dev"

echo Both servers are starting. You can close this window.
pause
