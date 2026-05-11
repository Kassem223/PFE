const reservationController = require('./controllers/reservationController');
const db = require('./config/database');

async function testRoomAvailability() {
  try {
    console.log('=== Testing Room Availability Check ===');
    
    // Get a database connection
    const connection = await db.getConnection();
    
    // Test 1: Check availability for a room during available time
    console.log('\n--- Test 1: Checking availability during free time ---');
    const availability1 = await reservationController.checkRoomAvailability(
      connection,
      1, // room ID (assuming room with ID 1 exists)
      '2026-12-15', // future date
      '14:00', // start time
      '15:00'  // end time
    );
    console.log('Result:', availability1);
    
    // Test 2: Check availability with 30-minute buffer
    console.log('\n--- Test 2: Testing 30-minute buffer logic ---');
    const availability2 = await reservationController.checkRoomAvailability(
      connection,
      1, // room ID
      '2026-12-15', // future date
      '10:30', // start time (30 minutes after a hypothetical 10:00 meeting)
      '11:30'  // end time
    );
    console.log('Result:', availability2);
    
    // Test 3: Test time addition helper function
    console.log('\n--- Test 3: Testing time addition function ---');
    const time1 = reservationController.addMinutesToTime('09:30', 30);
    const time2 = reservationController.addMinutesToTime('17:45', 30);
    console.log('09:30 + 30 minutes =', time1);
    console.log('17:45 + 30 minutes =', time2);
    
    connection.release();
    console.log('\n=== Test completed ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRoomAvailability();
