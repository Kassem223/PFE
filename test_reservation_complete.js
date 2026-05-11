const axios = require('axios');

async function testCompleteReservation() {
  try {
    console.log('=== Test complet de réservation avec équipements ===');
    
    // Test 1: Réservation simple avec équipements supplémentaires
    console.log('\n1. Test réservation simple avec équipements...');
    const simpleReservation = {
      id_equipement: 1,
      id_user: 1,
      date_reservation: '2026-05-11',
      time_start: '09:00',
      time_end: '10:00',
      nombre_personnes: 2,
      additional_equipments: [2, 3] // Équipements supplémentaires
    };
    
    try {
      const response1 = await axios.post('http://localhost:3000/api/reservations', simpleReservation);
      console.log('✅ Réservation simple avec équipements:', response1.data);
    } catch (error) {
      console.error('❌ Erreur réservation simple:', error.response?.data || error.message);
    }

    // Test 2: Réservation avec invitations et équipements
    console.log('\n2. Test réservation avec invitations et équipements...');
    const reservationWithInvitations = {
      id_equipement: 2,
      id_user: 1,
      date_reservation: '2026-05-12',
      time_start: '14:00',
      time_end: '16:00',
      nombre_personnes: 3,
      internal_users: [2],
      external_emails: ['test@example.com'],
      additional_equipments: [4, 5] // Équipements supplémentaires
    };
    
    try {
      const response2 = await axios.post('http://localhost:3000/api/reservations/with-invitations', reservationWithInvitations);
      console.log('✅ Réservation avec invitations et équipements:', response2.data);
    } catch (error) {
      console.error('❌ Erreur réservation avec invitations:', error.response?.data || error.message);
    }

    console.log('\n=== Test terminé ===');
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

testCompleteReservation();
