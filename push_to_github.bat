@echo off
cd /d "C:\Users\muhta\OneDrive\Desktop\Kareem IT\Personal"
git add .
git commit -m "Update project files - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin master
pause
