// Test simple pour vérifier que tout fonctionne
const axios = require('axios');

async function testFinal() {
  try {
    console.log('Test final de réservation avec équipements...');
    
    // Test avec des équipements
    const testData = {
      id_equipement: 1, // Salle
      id_user: 1,
      date_reservation: '2026-05-11',
      time_start: '09:00',
      time_end: '10:00',
      nombre_personnes: 2,
      additional_equipments: [2, 3] // Équipements à cocher
    };
    
    console.log('Envoi:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('Succès:', response.data);
    
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

testFinal();
