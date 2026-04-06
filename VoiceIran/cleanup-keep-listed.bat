@echo off
REM Script to clean up duplicate files in Voice-Iran.ir folder, keeping only backend files

SET "TARGET_DIR=D:\code\Voice-Iran.ir\VoiceIran"

echo Cleaning up duplicate files from %TARGET_DIR%...

REM ============================================
REM FILES TO DELETE (exist in frontend root)
REM ============================================
del /f /q "%TARGET_DIR%\.gitignore" 2>nul
del /f /q "%TARGET_DIR%\agents.md" 2>nul
del /f /q "%TARGET_DIR%\components.json" 2>nul
del /f /q "%TARGET_DIR%\FRONTEND_BACKEND_DYNAMIC_NOTES.md" 2>nul
del /f /q "%TARGET_DIR%\FRONTEND_MOCK_AUDIT.md" 2>nul
del /f /q "%TARGET_DIR%\next-env.d.ts" 2>nul
del /f /q "%TARGET_DIR%\next.config.mjs" 2>nul
del /f /q "%TARGET_DIR%\package.json" 2>nul
del /f /q "%TARGET_DIR%\pnpm-lock.yaml" 2>nul
del /f /q "%TARGET_DIR%\postcss.config.mjs" 2>nul
del /f /q "%TARGET_DIR%\proxy.ts" 2>nul
del /f /q "%TARGET_DIR%\tsconfig.json" 2>nul
del /f /q "%TARGET_DIR%\tsconfig.tsbuildinfo" 2>nul
del /f /q "%TARGET_DIR%\VOICEIRAN_ADMIN_DASHBOARD_RBAC_ANALYSIS.md" 2>nul
del /f /q "%TARGET_DIR%\VOICEIRAN_BACKEND_COMPLETION_ROADMAP.md" 2>nul
del /f /q "%TARGET_DIR%\VOICEIRAN_DJANGO_APPS_ANALYSIS.md" 2>nul
del /f /q "%TARGET_DIR%\VOICEIRAN_MOCK_VS_FRONTEND_AUDIT.md" 2>nul
del /f /q "%TARGET_DIR%\VOICEIRAN_MODELS_FIELDS_RELATIONS.md" 2>nul
del /f /q "%TARGET_DIR%\BACKEND_APPS_MODELS_FIELDS_SUMMARY.md" 2>nul
del /f /q "%TARGET_DIR%\clean_migrations.py" 2>nul

REM ============================================
REM DIRECTORIES TO DELETE (frontend only)
REM ============================================
if exist "%TARGET_DIR%\.next" rmdir /s /q "%TARGET_DIR%\.next"
if exist "%TARGET_DIR%\app" rmdir /s /q "%TARGET_DIR%\app"
if exist "%TARGET_DIR%\components" rmdir /s /q "%TARGET_DIR%\components"
if exist "%TARGET_DIR%\hooks" rmdir /s /q "%TARGET_DIR%\hooks"
if exist "%TARGET_DIR%\i18n" rmdir /s /q "%TARGET_DIR%\i18n"
if exist "%TARGET_DIR%\lib" rmdir /s /q "%TARGET_DIR%\lib"
if exist "%TARGET_DIR%\messages" rmdir /s /q "%TARGET_DIR%\messages"
if exist "%TARGET_DIR%\mock" rmdir /s /q "%TARGET_DIR%\mock"
if exist "%TARGET_DIR%\public" rmdir /s /q "%TARGET_DIR%\public"
if exist "%TARGET_DIR%\schemas" rmdir /s /q "%TARGET_DIR%\schemas"
if exist "%TARGET_DIR%\styles" rmdir /s /q "%TARGET_DIR%\styles"
if exist "%TARGET_DIR%\tiptap_vendor" rmdir /s /q "%TARGET_DIR%\tiptap_vendor"
if exist "%TARGET_DIR%\types" rmdir /s /q "%TARGET_DIR%\types"
if exist "%TARGET_DIR%\node_modules" rmdir /s /q "%TARGET_DIR%\node_modules"

REM ============================================
REM BACKEND SPECIFIC FILES TO KEEP
REM ============================================
echo.
echo === BACKEND FILES TO KEEP ===
dir /b "%TARGET_DIR%\*.py" 2>nul
dir /b "%TARGET_DIR%\VoiceIran" 2>nul
dir /b "%TARGET_DIR%\accounts" 2>nul
dir /b "%TARGET_DIR%\api" 2>nul
dir /b "%TARGET_DIR%\news" 2>nul
dir /b "%TARGET_DIR%\achievements" 2>nul
dir /b "%TARGET_DIR%\arsenal" 2>nul
dir /b "%TARGET_DIR%\martyrs" 2>nul
dir /b "%TARGET_DIR%\documents" 2>nul
dir /b "%TARGET_DIR%\localization" 2>nul
dir /b "%TARGET_DIR%\taxonomy" 2>nul
dir /b "%TARGET_DIR%\seo" 2>nul
dir /b "%TARGET_DIR%\search_index" 2>nul
dir /b "%TARGET_DIR%\analytics" 2>nul
dir /b "%TARGET_DIR%\notifications" 2>nul
dir /b "%TARGET_DIR%\publishing" 2>nul
dir /b "%TARGET_DIR%\.github" 2>nul
dir /b "%TARGET_DIR%\workflows" 2>nul

echo.
echo Cleanup complete!
pause