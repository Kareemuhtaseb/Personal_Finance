@echo off
echo Starting FinanceHub Backend Development Server...
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo Please update the .env file with your database credentials before continuing.
    echo.
    pause
    exit /b 1
)

echo Generating Prisma client...
npm run db:generate

echo.
echo Starting development server...
echo API will be available at: http://localhost:3001
echo Health check: http://localhost:3001/health
echo.

npm run dev
