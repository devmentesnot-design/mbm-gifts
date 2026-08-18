Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot\..\public\favicon-512.png"
if (-not (Test-Path $srcPath)) {
    $srcPath = "$PSScriptRoot\..\public\favicon-192.png"
}

$srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)

function Resize-Png ($img, $width, $height, $outPath) {
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImage = New-Object System.Drawing.Bitmap($width, $height)
    $destImage.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()
    $destImage.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
}

$pubDir = (Resolve-Path "$PSScriptRoot\..\public").Path

Resize-Png $srcImg 48 48 "$pubDir\favicon-48.png"
Resize-Png $srcImg 96 96 "$pubDir\favicon-96.png"
Resize-Png $srcImg 144 144 "$pubDir\favicon-144.png"
Resize-Png $srcImg 16 16 "$pubDir\favicon-16.png"
Resize-Png $srcImg 32 32 "$pubDir\favicon-32.png"

# Now generate favicon.ico using binary stream containing 16x16, 32x32, 48x48 PNG frames
$sizes = @(16, 32, 48)
$pngBytesList = @()

foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $s, $s)
    $g.Dispose()
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $pngBytesList += ,$ms.ToArray()
    $ms.Dispose()
}

$srcImg.Dispose()

# Build ICO binary format with embedded PNGs (standard modern ICO)
$fs = [System.IO.File]::Create("$pubDir\favicon.ico")
$bw = New-Object System.IO.BinaryWriter($fs)

# ICONDIR Header
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # ICO type
$bw.Write([uint16]$sizes.Count) # Image count

$offset = 6 + ($sizes.Count * 16)

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $bytes = $pngBytesList[$i]
    
    # ICONDIRENTRY
    $bw.Write([byte]($s -band 0xFF)) # Width (0 means 256)
    $bw.Write([byte]($s -band 0xFF)) # Height
    $bw.Write([byte]0)               # Colors in palette
    $bw.Write([byte]0)               # Reserved
    $bw.Write([uint16]1)             # Color planes
    $bw.Write([uint16]32)            # Bits per pixel
    $bw.Write([uint32]$bytes.Length) # Image size in bytes
    $bw.Write([uint32]$offset)       # Image offset
    
    $offset += $bytes.Length
}

# Write PNG byte arrays
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bw.Write($pngBytesList[$i])
}

$bw.Close()
$fs.Close()

Write-Host "SUCCESS: Generated favicon.ico, favicon-48.png, favicon-96.png, favicon-144.png, favicon-32.png, favicon-16.png in $pubDir"
