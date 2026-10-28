# Gera dist\Pin-<versão>.zip só com o que a extensão precisa.
# Usa ZipFile em vez de Compress-Archive: o do PowerShell 5.1 grava "\" nos
# caminhos do zip, e o Chrome Web Store recusa.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$raiz = Split-Path -Parent $PSScriptRoot
$versao = (Get-Content (Join-Path $raiz 'manifest.json') -Raw -Encoding utf8 | ConvertFrom-Json).version
$dist = Join-Path $raiz 'dist'
$preparo = Join-Path $dist 'preparo'
if (Test-Path $preparo) { Remove-Item $preparo -Recurse -Force }
New-Item -ItemType Directory -Force $preparo | Out-Null
foreach ($item in 'manifest.json', 'src', 'icons') {
    Copy-Item (Join-Path $raiz $item) $preparo -Recurse
}
$zip = Join-Path $dist "Pin-$versao.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($preparo, $zip)
Remove-Item $preparo -Recurse -Force
Write-Output $zip
