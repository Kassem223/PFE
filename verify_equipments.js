const db = require('./backend/config/database');

async function verifyEquipments() {
  try {
    const [rows] = await db.execute('SELECT * FROM equipements WHERE category_id = 3 ORDER BY id DESC LIMIT 7');
    console.log('Équipements créés:');
    rows.forEach(equip => {
      console.log(`ID: ${equip.id}, Nom: ${equip.nom}, Détails: ${equip.details}`);
    });
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyEquipments();
