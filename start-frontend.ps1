# PowerShell script to start the frontend
Write-Host "Starting Eyewearr Frontend..." -ForegroundColor Green

# Set environment variables
$env:PORT = "3002"
$env:DISABLE_ESLINT_PLUGIN = "true"

# Start the React app
npm start