
$file = "C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\lib\similarity.ts"
$content = Get-Content $file -Raw

# Add random jitter to similarityScore
$content = $content -replace "similarityScore = Math.max\(10\.0, 100\.0 - totalPenalty\);", "similarityScore = Math.max(10.0, 100.0 - totalPenalty);`n    similarityScore += (Math.random() * 0.5); // Add small random jitter to prevent identical sorting for similar odds"

# Save the file
Set-Content -Path $file -Value $content

