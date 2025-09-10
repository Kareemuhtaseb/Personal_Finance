# PowerShell script to push to GitHub
Set-Location "C:\Users\kmuht\OneDrive\Desktop\KM"

# Disable git pager
$env:GIT_PAGER = ""

# Add all changes
Write-Host "Adding all changes..."
git add .

# Check status
Write-Host "Checking git status..."
git status --porcelain

# Commit changes
Write-Host "Committing changes..."
git commit -m "Update project files - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin master

Write-Host "Done!"
