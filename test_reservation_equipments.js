const axios = require('axios');

async function testReservationEquipments() {
  try {
    console.log('=== Test de réservation avec équipements ===');
    
    // Simuler une réservation de salle avec équipements
    const testData = {
      id_equipement: 1, // ID de la salle
      id_user: 1,
      date_reservation: '2026-05-11',
      time_start: '09:00',
      time_end: '10:00',
      nombre_personnes: 2,
      additional_equipments: [2, 3, 4] // IDs des équipements cochés
    };
    
    console.log('Données envoyées:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('✅ Réservation créée:', response.data);
    
    // Vérifier que les équipements sont bien dans la table
    console.log('📋 Les équipements [2, 3, 4] devraient être dans reservation_equipments');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testReservationEquipments();
