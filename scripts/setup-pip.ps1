$ErrorActionPreference = 'Stop'
$destDir = 'D:\VICE CLIPS\ai-engine\python'
$pthFile = Join-Path $destDir 'python311._pth'

Write-Host "Enabling site-packages in python311._pth..."
if (Test-Path $pthFile) {
    $content = Get-Content $pthFile
    $newContent = $content | ForEach-Object {
        if ($_ -eq '#import site') { 'import site' } else { $_ }
    }
    # Also ensure '.' and 'Scripts' are present
    if (-not ($newContent -contains 'import site')) {
        $newContent += 'import site'
    }
    Set-Content $pthFile $newContent
}

$getPipUrl = 'https://bootstrap.pypa.io/get-pip.py'
$getPipFile = Join-Path $destDir 'get-pip.py'
Write-Host "Downloading get-pip.py..."
Invoke-WebRequest -Uri $getPipUrl -OutFile $getPipFile -UseBasicParsing

Write-Host "Installing pip..."
$pyExe = Join-Path $destDir 'python.exe'
& $pyExe $getPipFile --no-warn-script-location
Remove-Item $getPipFile

$pipExe = Join-Path $destDir 'Scripts\pip.exe'
Write-Host "Verifying pip installation..."
& $pipExe --version
