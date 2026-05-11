# Script PowerShell pour supprimer l'ancienne table equipement
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/clean-old-table" -Method POST -ContentType "application/json"
    Write-Host "Succès: $($response.message)"
} catch {
    Write-Host "Erreur: $($_.Exception.Message)"
}
