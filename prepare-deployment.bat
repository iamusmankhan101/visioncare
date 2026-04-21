@echo off
echo Preparing files for Hostinger deployment...
echo.

REM Copy .htaccess to build folder
copy ".htaccess" "build\.htaccess"

echo ✅ .htaccess file copied to build folder
echo.

echo 📁 Your deployment files are ready in the 'build' folder:
echo    - All React app files (optimized for production)
echo    - .htaccess file for proper routing
echo.

echo 🚀 Next steps:
echo    1. Login to your Hostinger control panel
echo    2. Go to File Manager → public_html
echo    3. Delete default files in public_html
echo    4. Upload ALL contents from the 'build' folder
echo    5. Your website will be live!
echo.

echo 📖 Full deployment guide: DEPLOYMENT_GUIDE.md
echo.
pause
