$file = 'c:\Users\laptop solutions\Desktop\eyewearr\src\pages\AdminPage.js'
$content = Get-Content $file -Raw

# Step 1: Remove the existing submit button lines
$lines = $content -split "`n"
$newLines = @()
$skipNext = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($skipNext -gt 0) {
        $skipNext--
        continue
    }
    
    $line = $lines[$i]
    
    # Skip the submit button block
    if ($line -match '^\s*<SubmitButton type="submit"') {
        $skipNext = 2  # Skip this line and next 2 lines
        continue
    }
    
    $newLines += $line
}

# Step 2: Find where to insert the new submit button
$finalLines = @()
$insertAfterNext = $false

for ($i = 0; $i -lt $newLines.Length; $i++) {
    $line = $newLines[$i]
    $finalLines += $line
    
    # Look for the end of ProductFormLayout in the add-product section
    if ($line -match '^\s*</ProductFormLayout>\s*$' -and !$insertAfterNext) {
        # Add the submit button here
        $finalLines += '                    '
        $finalLines += '                    {/* Submit button positioned after Product Gallery */}'
        $finalLines += '                    <SubmitButton '
        $finalLines += '                      type="button" '
        $finalLines += '                      disabled={isLoading}'
        $finalLines += '                      onClick={(e) => {'
        $finalLines += '                        e.preventDefault();'
        $finalLines += '                        const form = document.querySelector(''form'');'
        $finalLines += '                        if (form) {'
        $finalLines += '                          const submitEvent = new Event(''submit'', { bubbles: true, cancelable: true });'
        $finalLines += '                          form.dispatchEvent(submitEvent);'
        $finalLines += '                        }'
        $finalLines += '                      }}'
        $finalLines += '                    >'
        $finalLines += '                      {isLoading ? ''Adding Product...'' : ''Add Product''}'
        $finalLines += '                    </SubmitButton>'
        $insertAfterNext = $true
    }
}

# Write the modified content back
$finalContent = $finalLines -join "`n"
Set-Content $file $finalContent -NoNewline

Write-Host "Successfully moved the submit button to after the Product Gallery section!"
