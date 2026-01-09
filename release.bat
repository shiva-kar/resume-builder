@echo off
REM Resume Builder - Quick Release Script
REM Author: Shiva Kar
REM Usage: release.bat [patch|minor|major]

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   RESUME BUILDER - QUICK RELEASE
echo   https://github.com/shiva-kar/resume-builder
echo ========================================
echo.

set VERSION_TYPE=%1
if "%VERSION_TYPE%"=="" set VERSION_TYPE=patch

echo [1/6] Checking prerequisites...

REM Check if gh CLI is installed
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] GitHub CLI (gh) not found!
    echo Please install it from: https://cli.github.com/
    exit /b 1
)

REM Check gh auth
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Not authenticated with GitHub CLI
    echo Run: gh auth login
    exit /b 1
)

echo [OK] Prerequisites checked

echo.
echo [2/6] Running release script with --%VERSION_TYPE% bump...
echo.

node scripts/release.js --%VERSION_TYPE% -y

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Release script failed!
    exit /b 1
)

echo.
echo ========================================
echo   RELEASE COMPLETE!
echo ========================================
echo.

pause
