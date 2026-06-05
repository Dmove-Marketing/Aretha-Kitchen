$urls = @(
  "https://dmove.com.br/wp-content/uploads/2024/01/Logotipo-Negativo.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/Logotipo-Branco.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/Logotipo-negativo.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/Logotipo-branco.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/logo-dmove-branco.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/logo-dmove-negativo.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/DM-Negativo.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/DM-Branco.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/DM-negativo.png",
  "https://dmove.com.br/wp-content/uploads/2024/01/DM-branco.png"
)
foreach ($url in $urls) {
  try {
    $req = [System.Net.WebRequest]::Create($url)
    $req.Method = "HEAD"
    $resp = $req.GetResponse()
    Write-Host "FOUND: $url"
    $resp.Close()
  } catch {
    # Not found
  }
}
