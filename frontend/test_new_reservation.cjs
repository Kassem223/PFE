const axios = require('axios');

async function testNewReservation() {
  try {
    // Créer une nouvelle réservation avec équipements
    const testData = {
      id_equipement: 2, // Une salle
      id_user: 1,
      date_reservation: '2026-05-13',
      time_start: '10:00',
      time_end: '11:00',
      additional_equipments: [8, 5, 6], // Ordinateur, Chaise, Video projecteur
      nombre_personnes: 2
    };

    console.log('Création d\'une nouvelle réservation avec équipements:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('Réponse du serveur:', response.data);
    
    // Vérifier immédiatement après création
    setTimeout(async () => {
      const checkResponse = await axios.get('http://localhost:3000/api/reservations');
      const newReservation = checkResponse.data.find(r => r.id_reservation === response.data.reservationId);
      
      if (newReservation) {
        console.log('Nouvelle réservation récupérée:');
        console.log(`  - ID: ${newReservation.id_reservation}`);
        console.log(`  - Équipement principal: ${newReservation.equipement_nom}`);
        console.log(`  - Équipements additionnels: ${newReservation.additional_equipments || 'Aucun'}`);
      } else {
        console.log('Réservation non trouvée dans la liste');
      }
    }, 1000);
    
  } catch (error) {
    console.error('Erreur lors du test:', error.response?.data || error.message);
  }
}

testNewReservation();
