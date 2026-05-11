const axios = require('axios');

(async () => {
  try {
    // Tester l'API pour la réservation 143
    const response = await axios.get('http://localhost:3000/api/reservations/143/equipments');
    console.log('=== API RESPONSE FOR RESERVATION 143 ===');
    console.log(JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
})();
