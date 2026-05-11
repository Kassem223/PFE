const db = require('./config/database');

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Get categories
    const [categories] = await db.execute('SELECT * FROM categories');
    const sallesCategory = categories.find(c => c.name === 'Salles');
    const vehiculesCategory = categories.find(c => c.name === 'Véhicules');
    const equipementsCategory = categories.find(c => c.name === 'Équipements');
    
    if (!sallesCategory || !vehiculesCategory || !equipementsCategory) {
      console.error('Categories not found. Please run setup first.');
      return;
    }
    
    console.log('Categories found:', { salles: sallesCategory.id, vehicules: vehiculesCategory.id, equipements: equipementsCategory.id });
    
    // Get existing equipment from old table
    const [oldEquipment] = await db.execute('SELECT * FROM equipement');
    console.log(`Found ${oldEquipment.length} items in old equipement table`);
    
    // Migrate data based on resource type
    for (const item of oldEquipment) {
      // Get resource name to determine category
      const [resources] = await db.execute('SELECT r.name FROM resources r WHERE r.id = ?', [item.id_ressources]);
      const resourceName = resources[0]?.name;
      
      let targetTable, categoryId;
      
      if (resourceName?.includes('Salles') || resourceName?.includes('salle')) {
        targetTable = 'salles';
        categoryId = sallesCategory.id;
      } else if (resourceName?.includes('Flotte') || resourceName?.includes('Véhicule') || resourceName?.includes('vehicule')) {
        targetTable = 'vehicules';
        categoryId = vehiculesCategory.id;
      } else {
        targetTable = 'equipements';
        categoryId = equipementsCategory.id;
      }
      
      console.log(`Migrating "${item.nom}" to ${targetTable} (category: ${resourceName})`);
      
      try {
        if (targetTable === 'salles') {
          await db.execute(`
            INSERT INTO salles (category_id, nom, details, image_url, capacite, disponibilite) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [categoryId, item.nom, item.details, item.image_url, 0, true]);
        } else if (targetTable === 'vehicules') {
          await db.execute(`
            INSERT INTO vehicules (category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [categoryId, item.nom, item.details, item.image_url, null, null, null, true]);
        } else {
          await db.execute(`
            INSERT INTO equipements (category_id, nom, details, image_url, type_equipement, etat, disponibilite) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [categoryId, item.nom, item.details, item.image_url, null, 'bon', true]);
        }
        
        console.log(`✓ Migrated "${item.nom}" to ${targetTable}`);
      } catch (error) {
        console.error(`✗ Failed to migrate "${item.nom}":`, error.message);
      }
    }
    
    // Verify migration
    const [salles] = await db.execute('SELECT COUNT(*) as count FROM salles');
    const [vehicules] = await db.execute('SELECT COUNT(*) as count FROM vehicules');
    const [equipements] = await db.execute('SELECT COUNT(*) as count FROM equipements');
    
    console.log('\nMigration completed!');
    console.log(`Salles: ${salles[0].count} items`);
    console.log(`Véhicules: ${vehicules[0].count} items`);
    console.log(`Équipements: ${equipements[0].count} items`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateData();
