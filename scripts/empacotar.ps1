# Gera dist\Pin-<versão>-edge.zip (Edge/Chrome) e dist\Pin-<versão>-firefox.zip.
# O do Firefox leva browser_specific_settings, que o Edge acusa como chave
# desconhecida; por isso o manifest é ajustado só no zip do Firefox.
# Monta as entradas à mão: no PowerShell 5.1 tanto o Compress-Archive quanto o
# ZipFile.CreateFromDirectory gravam "\" nos caminhos, e as lojas recusam.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$raiz = Split-Path -Parent $PSScriptRoot
$textoManifest = Get-Content (Join-Path $raiz 'manifest.json') -Raw -Encoding utf8
$versao = ($textoManifest | ConvertFrom-Json).version
$dist = Join-Path $raiz 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null

$arquivos = Get-ChildItem (Join-Path $raiz 'src'), (Join-Path $raiz 'icons') -File -Recurse

function Novo-Zip($destino, $manifest) {
    if (Test-Path $destino) { Remove-Item $destino -Force }
    $saida = [System.IO.Compression.ZipFile]::Open($destino, 'Create')
    try {
        $entrada = $saida.CreateEntry('manifest.json')
        $fluxo = $entrada.Open()
        $bytes = (New-Object System.Text.UTF8Encoding $false).GetBytes($manifest)
        $fluxo.Write($bytes, 0, $bytes.Length)
        $fluxo.Dispose()
        foreach ($arquivo in $arquivos) {
            $nome = $arquivo.FullName.Substring($raiz.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($saida, $arquivo.FullName, $nome) | Out-Null
        }
    } finally {
        $saida.Dispose()
    }
    Write-Output $destino
}

Novo-Zip (Join-Path $dist "Pin-$versao-edge.zip") $textoManifest

# Firefox: id fixo (a AMO amarra as atualizações a ele) e a declaração de
# coleta de dados, obrigatória para extensão nova desde o Firefox 140.
$gecko = @'
  "browser_specific_settings": {
    "gecko": {
      "id": "pin-sem-anuncios@biazin.com.br",
      "strict_min_version": "140.0",
      "data_collection_permissions": { "required": ["none"] }
    },
    "gecko_android": { "strict_min_version": "142.0" }
  },
'@
$firefox = $textoManifest -replace '("manifest_version": 3,\r?\n)', "`$1$gecko`n"
if ($firefox -eq $textoManifest) { throw 'Não consegui inserir browser_specific_settings no manifest.' }
Novo-Zip (Join-Path $dist "Pin-$versao-firefox.zip") $firefox
