# PowerShell script to fix emoji encoding in XAML files
param(
    [string]$FilePath = "GUI/MandADiscoverySuite.xaml"
)

# Emoji replacement mappings
$emojiMappings = @{
    "🔍" = "&#x1F50D;"
    "👥" = "&#x1F465;"
    "💻" = "&#x1F4BB;"
    "🌐" = "&#x1F310;"
    "📊" = "&#x1F4CA;"
    "🗄️" = "&#x1F5C4;"
    "📁" = "&#x1F4C1;"
    "🛡️" = "&#x1F6E1;"
    "📱" = "&#x1F4F1;"
    "🚀" = "&#x1F680;"
    "⚡" = "&#x26A1;"
    "📄" = "&#x1F4C4;"
    "📈" = "&#x1F4C8;"
    "🏢" = "&#x1F3E2;"
    "📉" = "&#x1F4C9;"
    "❌" = "&#x274C;"
    "✅" = "&#x2705;"
    "⚠️" = "&#x26A0;"
    "🗑️" = "&#x1F5D1;"
    "🕒" = "&#x1F552;"
    "⏳" = "&#x23F3;"
    "🌙" = "&#x1F319;"
    "🖥️" = "&#x1F5A5;"
    "🕸️" = "&#x1F578;"
    "☁️" = "&#x2601;"
    "📅" = "&#x1F4C5;"
    "🟢" = "&#x1F7E2;"
    "🟡" = "&#x1F7E1;"
    "🔴" = "&#x1F534;"
    "☑️" = "&#x2611;"
    "☐" = "&#x2610;"
    "📤" = "&#x1F4E4;"
    "📋" = "&#x1F4CB;"
    "👁️" = "&#x1F441;"
    "🔐" = "&#x1F510;"
    "🎲" = "&#x1F3B2;"
    "🔥" = "&#x1F525;"
    "⚙️" = "&#x2699;"
    "📐" = "&#x1F4D0;"
    "🚨" = "&#x1F6A8;"
    "🏠" = "&#x1F3E0;"
    "🔗" = "&#x1F517;"
    "🌊" = "&#x1F30A;"
    "👤" = "&#x1F464;"
    "🔄" = "&#x1F504;"
    "▶️" = "&#x25B6;"
    "◀️" = "&#x25B0;"
    "⏮️" = "&#x23EE;"
    "⏯️" = "&#x23EF;"
    "⏭️" = "&#x23ED;"
    "🔵" = "&#x1F535;"
    "🚪" = "&#x1F6AA;"
    "⏱️" = "&#x23F1;"
    "🔋" = "&#x1F50B;"
}

Write-Host "Starting emoji replacement in $FilePath..."

if (!(Test-Path $FilePath)) {
    Write-Host "File not found: $FilePath"
    exit 1
}

$content = Get-Content $FilePath -Raw
$replacementsMade = 0

foreach ($emoji in $emojiMappings.Keys) {
    $htmlEntity = $emojiMappings[$emoji]
    if ($content.Contains($emoji)) {
        $content = $content -replace [regex]::Escape($emoji), $htmlEntity
        $replacementsMade++
        # Write-Host "Replaced $emoji with $htmlEntity"
    }
}

if ($replacementsMade -gt 0) {
    Set-Content -Path $FilePath -Value $content -Encoding UTF8
    Write-Host "Successfully made $replacementsMade emoji replacements in $FilePath"
} else {
    Write-Host "No emoji replacements needed in $FilePath"
}