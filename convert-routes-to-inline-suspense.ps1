# Convert all withSuspense() calls to inline Suspense JSX

$file = 'C:\enterprisediscovery\guiv2\src\renderer\routes.tsx'
$content = Get-Content $file -Raw

Write-Host "Original file size: $($content.Length) characters"

# Count current withSuspense calls
$matchCount = ([regex]::Matches($content, 'withSuspense\(')).Count
Write-Host "Found $matchCount withSuspense() calls to convert"

# Pattern to match: element: withSuspense(ComponentName),
# Replace with: element: (<Suspense fallback={<LoadingFallback />}><ComponentName /></Suspense>),

$pattern = 'element:\s*withSuspense\((\w+)\),'
$replacement = 'element: (<Suspense fallback={<LoadingFallback />}><$1 /></Suspense>),'

$content = $content -replace $pattern, $replacement

# Count after conversion
$suspenseCount = ([regex]::Matches($content, '<Suspense fallback=')).Count
Write-Host "Converted to $suspenseCount inline Suspense elements"

# Save the file
Set-Content -Path $file -Value $content -NoNewline
Write-Host "File updated successfully!"

# Also update source
Copy-Item -Path $file -Destination 'D:\Scripts\UserMandA-1\guiv2\src\renderer\routes.tsx' -Force
Write-Host "Copied to source directory"
