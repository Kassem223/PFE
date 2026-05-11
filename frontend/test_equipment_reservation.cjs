const axios = require('axios');

async function testEquipmentReservation() {
  try {
    // Test data simulating a reservation with equipment selection
    const testData = {
      id_equipement: 2, // Assuming this is a salle
      id_user: 1,
      date_reservation: '2026-05-12',
      time_start: '14:00',
      time_end: '15:00',
      additional_equipments: [9, 10, 11], // Ordinateur, Ecran de projection, Video projecteur
      nombre_personnes: 2
    };

    console.log('Envoi de la réservation test:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('Réponse du serveur:', response.data);
    
    // Vérifier que les équipements ont été sauvegardés
    setTimeout(async () => {
      const db = require('../backend/config/database');
      const [reservationEquipments] = await db.execute(
        'SELECT re.*, e.nom FROM reservation_equipments re JOIN equipements e ON re.id_equipement = e.id WHERE re.id_reservation = ?',
        [response.data.reservationId]
      );
      console.log('Équipements sauvegardés pour la réservation', response.data.reservationId, ':', reservationEquipments);
      await db.end();
    }, 1000);
    
  } catch (error) {
    console.error('Erreur lors du test:', error.response?.data || error.message);
  }
}

testEquipmentReservation();
