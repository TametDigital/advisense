param(
    [int]$Port = 4173,
    [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

function Get-Ext($path) {
    if ($path -match '\.([A-Za-z0-9]+)$') {
        return ".$($matches[1].ToLower())"
    }
    return ""
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    try {
        $urlPath = [uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        $filePath = Join-Path $Root ($urlPath.TrimStart("/"))

        if (Test-Path -LiteralPath $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
            $ext = Get-Ext $filePath
            $contentType = $mimeMap[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            $bytes = Get-Content -LiteralPath $filePath -Encoding Byte -ReadCount 0
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [byte[]][char[]]"404 Not Found: $urlPath"
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
    } catch {
        Write-Host "ERROR handling $($request.Url): $($_.Exception.Message)"
        $response.StatusCode = 500
        $errMsg = [byte[]][char[]]"500 Error: $($_.Exception.Message)"
        $response.ContentLength64 = $errMsg.Length
        $response.OutputStream.Write($errMsg, 0, $errMsg.Length)
    } finally {
        $response.OutputStream.Close()
    }
}
