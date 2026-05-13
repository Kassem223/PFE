const axios = require('axios');

async function testApi() {
  try {
    const response = await axios.post('http://localhost:3000/api/reservations', {
      id_equipement: 1,
      id_user: 1,
      date_reservation: '2026-05-15',
      time_start: '09:00',
      time_end: '10:00',
      additional_equipments: [],
      nombre_personnes: 1
    });
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', error.response.status);
      console.error('API Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApi();
