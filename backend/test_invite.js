const axios = require('axios');

async function testSignup() {
  try {
    const response = await axios.post('http://localhost:3000/api/register-from-invitation', {
      token: 'a6b14b213cfcb1f99bf620a51833f9e6dd23cfa18a32ad2c45c14ce535ec03e2',
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      mdp: 'password123',
      adresse: '',
      jobtitle: '',
      departement: ''
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSignup();
