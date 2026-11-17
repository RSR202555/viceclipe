$ErrorActionPreference = 'Stop'
$zipUrl = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
$destDir = 'D:\VICE CLIPS\ai-engine\python'

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$zipFile = Join-Path $destDir 'python-embed.zip'
Write-Host "Downloading Python 3.11 embeddable..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UseBasicParsing

Write-Host "Extracting Python..."
Expand-Archive -Path $zipFile -DestinationPath $destDir -Force
Remove-Item $zipFile

Write-Host "Verifying Python executable..."
$pyExe = Join-Path $destDir 'python.exe'
& $pyExe --version
