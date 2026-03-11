# This script ensures the backend is started correctly.
# 1. It activates the Python virtual environment.
# 2. It navigates into the 'backend' directory.
# 3. It runs the Flask application.

# Stop on any error
$ErrorActionPreference = "Stop"

# Get the directory of the current script
$scriptPath = $PSScriptRoot

# Define paths
$venvPath = Join-Path $scriptPath "backend/env/Scripts/Activate.ps1"
$backendPath = Join-Path $scriptPath "backend"

# Check if virtual environment exists
if (-not (Test-Path $venvPath)) {
    Write-Error "Virtual environment not found at $venvPath. Please run the setup instructions again."
    exit 1
}

# Activate virtual environment and run the app
try {
    Write-Host "Activating Python virtual environment..."
    . $venvPath
    
    Write-Host "Navigating to backend directory: $backendPath"
    Set-Location $backendPath
    
    Write-Host "Starting Flask backend server..."
    python app.py

} catch {
    Write-Error "An error occurred: $_"
    exit 1
}
