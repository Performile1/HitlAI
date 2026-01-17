# PowerShell script to fix module-level Supabase client initialization
$files = @(
    "app\tester\performance\page.tsx",
    "app\tester\login\page.tsx",
    "app\tester\dashboard\page.tsx",
    "app\company\tests\[id]\page.tsx",
    "app\company\tests\new\page.tsx",
    "app\company\signup\page.tsx",
    "app\company\tests\[id]\rate\page.tsx",
    "app\company\login\page.tsx",
    "app\company\dashboard\page.tsx",
    "app\admin\login\page.tsx",
    "app\admin\flagged-testers\page.tsx"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Pattern to match module-level supabase creation
        $pattern = "(?ms)^(import.*?createClient.*?\n)\n(const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!\s*\)\n)"
        
        if ($content -match $pattern) {
            # Remove the module-level declaration
            $content = $content -replace $pattern, "`$1`n"
            
            # Find the component function and add useMemo import if not present
            if ($content -notmatch "import.*?useMemo") {
                $content = $content -replace "(import \{ useState)", "import { useState, useMemo"
            }
            
            # Find the component body and add supabase initialization
            # Look for the first useState or const declaration after function declaration
            $content = $content -replace "(export default function \w+\([^)]*\) \{[^\n]*\n(?:\s*const [^=]+ = [^\n]+\n)*)", "`$1  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])`n`n"
            
            Set-Content $filePath $content -NoNewline
            Write-Host "Fixed: $file" -ForegroundColor Green
        } else {
            Write-Host "No match or already fixed: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
