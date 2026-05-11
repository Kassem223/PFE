const axios = require('axios');

async function testReservation() {
  try {
    console.log('Testing reservation API...');
    
    const testData = {
      id_equipement: 1,
      id_user: 1,
      date_reservation: '2026-05-11',
      time_start: '09:00',
      time_end: '10:00',
      nombre_personnes: 1
    };
    
    console.log('Sending data:', testData);
    
    const response = await axios.post('http://localhost:3000/api/reservations', testData);
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testReservation();
