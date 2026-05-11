const axios = require('axios');

async function testEquipmentDisplay() {
  try {
    // Récupérer les réservations pour vérifier l'affichage
    const response = await axios.get('http://localhost:3000/api/reservations');
    console.log('Réservations avec équipements:');
    response.data.forEach(reservation => {
      console.log(`Réservation ${reservation.id_reservation}:`);
      console.log(`  - Équipement principal: ${reservation.equipement_nom}`);
      console.log(`  - Équipements additionnels: ${reservation.additional_equipments || 'Aucun'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

testEquipmentDisplay();
