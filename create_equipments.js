const db = require('./backend/config/database');

async function createEquipments() {
  try {
    const equipments = [
      { nom: 'Ordinateur', details: 'Ordinateur portable ou de bureau', category_id: 3 },
      { nom: 'Ecran de projection', details: 'Écran pour projection vidéo', category_id: 3 },
      { nom: 'Video projecteur', details: 'Projecteur vidéo pour présentations', category_id: 3 },
      { nom: 'Chaise', details: 'Chaise pour salle de réunion', category_id: 3 },
      { nom: 'Imprimante', details: 'Imprimante multifonction', category_id: 3 },
      { nom: 'Ecran interactif', details: 'Écran tactile interactif', category_id: 3 },
      { nom: 'Tableau d\'affichage', details: 'Tableau blanc ou numérique', category_id: 3 }
    ];

    for (const equip of equipments) {
      const [result] = await db.execute(
        'INSERT INTO equipements (category_id, nom, details, disponibilite) VALUES (?, ?, ?, ?)',
        [equip.category_id, equip.nom, equip.details, true]
      );
      console.log(`Créé: ${equip.nom} (ID: ${result.insertId})`);
    }

    console.log('Tous les équipements ont été créés avec succès!');
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createEquipments();
