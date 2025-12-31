$files = Get-ChildItem -Path 'guiv2' -Recurse -Include *.md | Where-Object { $_.FullName -notlike '*node_modules*' }

$files | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch 'Last Updated.*30/12/2025') {
        $metadata = @"
**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0

"@
        $newContent = $metadata + $content
        Set-Content $_.FullName $newContent
    }
}