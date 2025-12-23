@echo off
echo Fixing emoji encoding in XAML files...
set "file=%~dp0..\GUI\MandADiscoverySuite.xaml"

if not exist "%file%" (
    echo File not found: %file%
    goto end
)

powershell -Command "
$content = Get-Content '%file%' -Raw
$replacements = @{}

# Define emoji replacements
$emojiMap = @{
    '🔍' = '&#x1F50D;'
    '👥' = '&#x1F465;'
    '💻' = '&#x1F4BB;'
    '🌐' = '&#x1F310;'
    '📊' = '&#x1F4CA;'
    '🗄️' = '&#x1F5C4;'
    '📁' = '&#x1F4C1;'
    '🛡️' = '&#x1F6E1;'
    '📱' = '&#x1F4F1;'
    '🚀' = '&#x1F680;'
    '⚡' = '&#x26A1;'
    '📄' = '&#x1F4C4;'
    '📈' = '&#x1F4C8;'
    '🏢' = '&#x1F3E2;'
    '📉' = '&#x1F4C9;'
}

$replacementCount = 0
foreach ($emoji in $emojiMap.Keys) {
    $entity = $emojiMap[$emoji]
    if ($content.Contains($emoji)) {
        $content = $content.Replace($emoji, $entity)
        $replacementCount++
    }
}

if ($replacementCount -gt 0) {
    Set-Content '%file%' -Value $content -Encoding UTF8
    Write-Host \"Successfully made $replacementCount emoji replacements\"
} else {
    Write-Host \"No emoji replacements needed\"
}
"

:end