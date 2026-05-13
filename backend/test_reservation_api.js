const axios = require('axios');

async function testReservation() {
  try {
    console.log('=== Testing Reservation Creation ===\n');

    // Test data - adjust these values based on your database
    const testData = {
      id_equipement: 1, // Should be a valid salle/equipement ID
      id_user: 1, // Should be a valid user ID
      date_reservation: '2026-05-15',
      time_start: '10:00',
      time_end: '11:00',
      nombre_personnes: 1,
      additional_equipments: []
    };

    console.log('Sending test reservation data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\nAttempting POST to http://localhost:3000/api/reservations...\n');

    const response = await axios.post('http://localhost:3000/api/reservations', testData);

    console.log('✓ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('✗ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.error);
    console.error('Error details:', error.response?.data?.details);
    console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
    console.error('\nAxios error:', error.message);

    if (error.response?.status === 500) {
      console.error('\n⚠️  500 Internal Server Error - Check backend console for details');
    }
  }

  process.exit(0);
}

testReservation();
