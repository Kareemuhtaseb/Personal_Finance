@echo off
echo Starting FinanceHub Application for Testing...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:5173

echo.
echo Application opened in browser!
echo.
echo Testing Checklist:
echo 1. Register a new account
echo 2. Login with your credentials
echo 3. Check dashboard data loading
echo 4. Test profile management in settings
echo 5. Test logout functionality
echo.
echo See CONNECTION_GUIDE.md for detailed testing instructions.
echo.
pause
