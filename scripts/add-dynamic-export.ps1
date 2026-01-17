# PowerShell script to add dynamic export to all client component pages
$pages = @(
    "app\admin\blog\new\page.tsx",
    "app\admin\blog\page.tsx",
    "app\admin\digital-twins\page.tsx",
    "app\admin\disputes\page.tsx",
    "app\admin\flagged-testers\page.tsx",
    "app\admin\forge\page.tsx",
    "app\admin\login\page.tsx",
    "app\admin\settings\page.tsx",
    "app\admin\style-guide\page.tsx",
    "app\admin\tests\page.tsx",
    "app\company\billing\page.tsx",
    "app\company\dashboard\page.tsx",
    "app\company\login\page.tsx",
    "app\company\settings\page.tsx",
    "app\company\signup\page.tsx",
    "app\company\tests\new\page.tsx",
    "app\tester\dashboard\page.tsx",
    "app\tester\earnings\page.tsx",
    "app\tester\login\page.tsx",
    "app\tester\mission-control\page.tsx",
    "app\tester\performance\page.tsx",
    "app\tester\settings\page.tsx",
    "app\tester\signup\page.tsx",
    "app\(marketing)\blog\page.tsx"
)

foreach ($page in $pages) {
    $filePath = Join-Path $PSScriptRoot "..\$page"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if already has dynamic export
        if ($content -notmatch "export const dynamic") {
            # Check if it's a client component
            if ($content -match "^'use client'") {
                # Add dynamic export after 'use client'
                $content = $content -replace "('use client'`r?`n)", "`$1`nexport const dynamic = 'force-dynamic'`n"
                Set-Content $filePath $content -NoNewline
                Write-Host "Added dynamic export to: $page" -ForegroundColor Green
            }
        } else {
            Write-Host "Already has dynamic export: $page" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $page" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
