const reservationController = require('./backend/controllers/reservationController');
const db = require('./backend/config/database');

async function testCreate() {
  const req = {
    body: {
      id_equipement: 1,
      id_user: 1,
      date_reservation: '2026-05-15',
      time_start: '09:00',
      time_end: '10:00',
      nombre_personnes: 2,
      additional_equipments: [2, 3]
    }
  };

  const res = {
    status: function(code) {
      console.log('Status set to:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', data);
    }
  };

  try {
    await reservationController.create(req, res);
  } catch (err) {
    console.error('Unhandled Error:', err);
  }
  process.exit(0);
}

testCreate();
