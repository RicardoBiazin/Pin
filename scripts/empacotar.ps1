# Gera dist\Pin-<versão>.zip só com o que a extensão precisa.
# Monta as entradas à mão: no PowerShell 5.1 tanto o Compress-Archive quanto o
# ZipFile.CreateFromDirectory gravam "\" nos caminhos, e o Chrome Web Store recusa.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$raiz = Split-Path -Parent $PSScriptRoot
$versao = (Get-Content (Join-Path $raiz 'manifest.json') -Raw -Encoding utf8 | ConvertFrom-Json).version
$dist = Join-Path $raiz 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "Pin-$versao.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }

$arquivos = @(Get-Item (Join-Path $raiz 'manifest.json'))
$arquivos += Get-ChildItem (Join-Path $raiz 'src'), (Join-Path $raiz 'icons') -File -Recurse
$saida = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
    foreach ($arquivo in $arquivos) {
        $nome = $arquivo.FullName.Substring($raiz.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($saida, $arquivo.FullName, $nome) | Out-Null
    }
} finally {
    $saida.Dispose()
}
Write-Output $zip
