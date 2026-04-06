@echo off
echo ========================================
echo   Deleting Voice-Iran.ir folder
echo ========================================
echo.

set "TARGET_FOLDER=D:\code\Voice-Iran.ir\VoiceIran"

if exist "%TARGET_FOLDER%" (
    echo Folder found: %TARGET_FOLDER%
    echo Deleting...
    rmdir /s /q "%TARGET_FOLDER%"
    
    if exist "%TARGET_FOLDER%" (
        echo [ERROR] Failed to delete folder!
        pause
        exit /b 1
    ) else (
        echo [SUCCESS] Folder deleted successfully!
    )
) else (
    echo [INFO] Folder does not exist: %TARGET_FOLDER%
)

echo.
pause
