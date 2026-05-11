# Script PowerShell pour tester si l'endpoint existe
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test" -Method GET
    Write-Host "Test endpoint fonctionne: $($response.message)"
    
    # Maintenant tester l'endpoint de suppression
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/drop-old-equipement-table" -Method POST
    Write-Host "Succès: $($response2.message)"
} catch {
    Write-Host "Erreur: $($_.Exception.Message)"
}
