const axios = require('axios');

async function testEquipmentSelection() {
  try {
    // Test avec les équipements nettoyés
    const testData = {
      id_equipement: 2, // Une salle
      id_user: 1,
      date_reservation: '2026-05-12',
      time_start: '16:00',
      time_end: '17:00',
      additional_equipments: [5, 6, 7], // Chaise, Video projecteur, Ecran de projection
      nombre_personnes: 3
    };

    console.log('Test de réservation avec équipements nettoyés:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('Réponse du serveur:', response.data);
    
    // Vérifier immédiatement les équipements sauvegardés
    setTimeout(async () => {
      const db = require('../backend/config/database');
      const [reservationEquipments] = await db.execute(
        'SELECT re.*, e.nom FROM reservation_equipments re JOIN equipements e ON re.id_equipement = e.id WHERE re.id_reservation = ? ORDER BY re.id',
        [response.data.reservationId]
      );
      console.log('Équipements sauvegardés pour la réservation', response.data.reservationId, ':', reservationEquipments);
      await db.end();
    }, 500);
    
  } catch (error) {
    console.error('Erreur lors du test:', error.response?.data || error.message);
  }
}

testEquipmentSelection();
