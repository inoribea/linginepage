$content = Get-Content -LiteralPath 'index.reordered.html' -Raw
$content = [regex]::Replace($content, '(<textarea id="creative-input"[^>]*?)\s+placeholder="[^"]*"', '$1', 1)
$content = [regex]::Replace($content, '(<textarea id="user-input"[^>]*?)\s+placeholder="[^"]*"', '$1', 1)
$content = [regex]::Replace($content, '\s*<figcaption[^>]*>.*?</figcaption>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
Set-Content -LiteralPath 'index.reordered.html' -Value $content
