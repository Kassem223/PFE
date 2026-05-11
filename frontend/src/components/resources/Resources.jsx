import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../landing/ThemeToggle';
import { LanguageSwitcher } from '../landing/LanguageSwitcher';

export const Resources = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [showManageCategories, setShowManageCategories] = useState(false); // Hidden by default
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '📁' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Check if user has management permissions (admins and managers can manage resources)
  const canManageResources = user?.role === 'admin';

  // Simulated database - Replace with actual API calls
  const mockDatabase = {
    categories: [
      { id: 1, name: 'Salle de Réunion', description: 'Salles équipées pour réunions', icon: '🏢', image: 'https://images.unsplash.com/photo-1497366216642-4d6f658d747?w=800&h=600&fit=crop' },
      { id: 2, name: 'Les Projecteurs', description: 'Projecteurs HD pour présentations', icon: '📽️', image: 'https://images.unsplash.com/photo-160329686950-3f1e26d39d0?w=800&h=600&fit=crop' },
      { id: 3, name: 'Les Véhicules', description: 'Flotte de véhicules professionnels', icon: '🚗', image: 'https://images.unsplash.com/photo-1550359946009-3c5a650d39e?w=800&h=600&fit=crop' },
      { id: 4, name: 'Cabine Acoustique', description: 'Espaces isolés phoniquement', icon: '🎙️', image: 'https://images.unsplash.com/photo-1560472359-c4119125a5a?w=800&h=600&fit=crop' },
      { id: 5, name: 'Les Réunions en Ligne', description: 'Salles virtuelles pour visioconférences', icon: '💻', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e684a?w=800&h=600&fit=crop' }
    ],
    resources: {
      'Salle de Réunion': [
        { id: 1, name: 'Salle A', capacity: 10, equipment: 'Projecteur, Tableau blanc', status: 'Disponible', location: 'Étage 1' },
        { id: 2, name: 'Salle B', capacity: 6, equipment: 'Écran, Système audio', status: 'Occupée', location: 'Étage 1' },
        { id: 3, name: 'Salle C', capacity: 15, equipment: 'Projecteur, Visioconférence', status: 'Disponible', location: 'Étage 2' },
        { id: 4, name: 'Salle D', capacity: 8, equipment: 'Tableau interactif', status: 'Maintenance', location: 'Étage 2' }
      ],
      'Les Projecteurs': [
        { id: 5, name: 'Projecteur 1', type: 'HD 1080p', lumens: 4000, status: 'Disponible', location: 'Stock A' },
        { id: 6, name: 'Projecteur 2', type: '4K Ultra HD', lumens: 6000, status: 'Occupé', location: 'Salle A' },
        { id: 7, name: 'Projecteur 3', type: 'HD 1080p', lumens: 3500, status: 'Disponible', location: 'Stock B' }
      ],
      'Les Véhicules': [
        { id: 8, name: 'Voiture A', type: 'Berline', plaque: 'TU-123-AB', status: 'Disponible', driver: 'Non assigné' },
        { id: 9, name: 'Voiture B', type: 'SUV', plaque: 'TU-456-CD', status: 'En mission', location: 'Centre-ville' },
        { id: 10, name: 'Voiture C', type: 'Utilitaire', plaque: 'TU-789-EF', status: 'Disponible', driver: 'Non assigné' }
      ],
      'Cabine Acoustique': [
        { id: 11, name: 'Cabine 1', size: 'Petite', equipment: 'Micros pro, Casques', status: 'Disponible', location: 'Étage -1' },
        { id: 12, name: 'Cabine 2', size: 'Moyenne', equipment: 'Console audio, Micros', status: 'Occupée', location: 'Étage -1' },
        { id: 13, name: 'Cabine 3', size: 'Grande', equipment: 'Studio complet', status: 'Disponible', location: 'Étage -1' }
      ],
      'Les Réunions en Ligne': [
        { id: 14, name: 'Salle Virtuelle 1', capacity: 50, platform: 'Zoom', status: 'Disponible', features: 'Enregistrement, Chat' },
        { id: 15, name: 'Salle Virtuelle 2', capacity: 100, platform: 'Teams', status: 'Occupée', features: 'Partage écran, Tableau blanc' },
        { id: 16, name: 'Salle Virtuelle 3', capacity: 25, platform: 'Google Meet', status: 'Disponible', features: 'Enregistrement' }
      ]
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Get category from URL hash and decode it properly
    const hash = window.location.hash;
    if (hash.startsWith('#resources-')) {
      const categoryName = decodeURIComponent(hash.replace('#resources-', ''));
      setCategory(categoryName);
      setResources(mockDatabase.resources[categoryName] || []);
    }
    
    // Load categories
    setCategories(mockDatabase.categories);
  }, []);

  const handleCategoryClick = (categoryName) => {
    setCategory(categoryName);
    setResources(mockDatabase.resources[categoryName] || []);
    // Encode category name for URL (twice to handle special characters properly)
    const encodedCategory = encodeURIComponent(encodeURIComponent(categoryName));
    window.location.hash = `#resources-${encodedCategory}`;
  };

  const handleViewResources = (categoryName) => {
    // Navigate to ResourceDetail page
    const encodedCategory = encodeURIComponent(encodeURIComponent(categoryName));
    window.location.hash = `#resources-${encodedCategory}`;
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const id = Math.max(...categories.map(c => c.id), 0) + 1;
      const categoryToAdd = { ...newCategory, id };
      setCategories([...categories, categoryToAdd]);
      setNewCategory({ name: '', description: '', icon: '📁' });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description, icon: category.icon });
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategory.name.trim()) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: newCategory.name, description: newCategory.description, icon: newCategory.icon }
          : cat
      ));
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', icon: '📁' });
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', icon: '📁' });
  };

  const renderResourceItem = (resource) => {
    const statusColor = {
      'Disponible': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Occupée': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En mission': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return (
      <div key={resource.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{resource.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[resource.status] || 'bg-gray-100 text-gray-800'}`}>
            {resource.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          {resource.capacity && <p><span className="font-medium">Capacité:</span> {resource.capacity} personnes</p>}
          {resource.equipment && <p><span className="font-medium">Équipement:</span> {resource.equipment}</p>}
          {resource.type && <p><span className="font-medium">Type:</span> {resource.type}</p>}
          {resource.lumens && <p><span className="font-medium">Lumens:</span> {resource.lumens}</p>}
          {resource.plaque && <p><span className="font-medium">Plaque:</span> {resource.plaque}</p>}
          {resource.size && <p><span className="font-medium">Taille:</span> {resource.size}</p>}
          {resource.platform && <p><span className="font-medium">Plateforme:</span> {resource.platform}</p>}
          {resource.location && <p><span className="font-medium">Localisation:</span> {resource.location}</p>}
          {resource.driver && <p><span className="font-medium">Chauffeur:</span> {resource.driver}</p>}
          {resource.features && <p><span className="font-medium">Fonctionnalités:</span> {resource.features}</p>}
        </div>
        
        <div className="mt-6 flex gap-3">
          <button className="flex-1 h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all border border-blue-500/50 dark:border-blue-400/30 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Réserver
          </button>
          <button className="flex-1 h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Détails
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <a href="#accueil" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-bold text-lg">R</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  reservi<span className="text-slate-600 dark:text-slate-400">.tn</span>
                </span>
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm">JD</span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!category ? (
          // Categories Grid View
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">Les Actifs que nous Gérons.</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mt-2">La Bibliothèque</p>
              </div>
              {canManageResources && (
                <button
                  onClick={() => setShowManageCategories(!showManageCategories)}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all border border-blue-500/50 dark:border-blue-400/30 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  {showManageCategories ? 'Fermer la gestion' : 'Gérer les catégories'}
                </button>
              )}
            </div>

            {showManageCategories && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                      placeholder="Nom de la catégorie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                      rows="3"
                      placeholder="Description de la catégorie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icône</label>
                    <input
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                      placeholder="📁"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {editingCategory ? (
                    <>
                      <button
                        onClick={handleUpdateCategory}
                        className="flex-1 h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all border border-blue-500/50 dark:border-blue-400/30 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Mettre à jour
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all border border-slate-300 dark:border-slate-600"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all border border-blue-500/50 dark:border-blue-400/30 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Ajouter la catégorie
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-[0_35px_70px_-20px_rgba(0,0,0,0.2)]"
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    <img 
                      src={cat.image || '/assets/placeholder.jpg'} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/assets/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </h3>
                      {canManageResources && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(cat);
                            }}
                            title="Modifier"
                            className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all text-white border border-emerald-400/30 dark:border-emerald-500/30"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat.id);
                            }}
                            title="Supprimer"
                            className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all text-white border border-red-400/30 dark:border-red-500/30"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Voir les détails
                      </span>
                      <button 
                        onClick={() => handleViewResources(cat.name)}
                        className="h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all border border-blue-500/50 dark:border-blue-400/30 flex items-center gap-1"
                      >
                        Explorer
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Category Detail View
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setCategory('')}
                className="h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all border border-slate-300 dark:border-slate-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Retour
              </button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {category}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(renderResourceItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
