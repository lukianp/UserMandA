$files = Get-ChildItem -Path 'guiv2/src' -Recurse -Include *.ts,*.js,*.tsx,*.jsx | Where-Object { (Get-Content $_.FullName -First 1) -match '^/\*\*' }

$files | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch '@author ljpops\.com') {
        $replacement = @"
 * @author ljpops.com (Lukian Poleschtschuk)
 * **Last Updated:** 30/12/2025
 * **Status:** Production
 * **Version:** 1.0
*/
"@
        $newContent = $content -replace '(\*/)$', $replacement
        Set-Content $_.FullName $newContent
    }
}