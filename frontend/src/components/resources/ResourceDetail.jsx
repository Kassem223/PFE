import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../landing/ThemeToggle';
import { LanguageSwitcher } from '../landing/LanguageSwitcher';
import { uploadImageToBackend } from '../../utils/cloudinary';

export const ResourceDetail = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [resources, setResources] = useState([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    capacity: '',
    equipment: '',
    status: 'Disponible',
    location: '',
    driver: '',
    features: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Simulated database - Replace with actual API calls
  const mockDatabase = {
    resources: {
      'Salle de Réunion': [
        { id: 1, name: 'Salle A', capacity: 10, equipment: 'Projecteur, Tableau blanc', status: 'Disponible', location: 'Étage 1', image: 'https://images.unsplash.com/photo-1497366216642-4d6f658d747?w=800&h=600&fit=crop' },
        { id: 2, name: 'Salle B', capacity: 6, equipment: 'Écran, Système audio', status: 'Occupée', location: 'Étage 1', image: 'https://images.unsplash.com/photo-1519452575417-567c1a0f57fd?w=800&h=600&fit=crop' },
        { id: 3, name: 'Salle C', capacity: 15, equipment: 'Projecteur, Visioconférence', status: 'Disponible', location: 'Étage 2', image: 'https://images.unsplash.com/photo-1519452575417-567c1a0f57fd?w=800&h=600&fit=crop' },
        { id: 4, name: 'Salle D', capacity: 8, equipment: 'Tableau interactif', status: 'Maintenance', location: 'Étage 2', image: 'https://images.unsplash.com/photo-1497366216642-4d6f658d747?w=800&h=600&fit=crop' }
      ],
      'Les Projecteurs': [
        { id: 5, name: 'Projecteur 1', type: 'HD 1080p', lumens: 4000, status: 'Disponible', location: 'Stock A', image: 'https://images.unsplash.com/photo-160329686950-3f1e26d39d0?w=800&h=600&fit=crop' },
        { id: 6, name: 'Projecteur 2', type: '4K Ultra HD', lumens: 6000, status: 'Occupé', location: 'Salle A', image: 'https://images.unsplash.com/photo-1603796836034-7021e6b8c5a0?w=800&h=600&fit=crop' },
        { id: 7, name: 'Projecteur 3', type: 'HD 1080p', lumens: 3500, status: 'Disponible', location: 'Stock B', image: 'https://images.unsplash.com/photo-160329686950-3f1e26d39d0?w=800&h=600&fit=crop' }
      ],
      'Les Véhicules': [
        { id: 8, name: 'Voiture A', type: 'Berline', plaque: 'TU-123-AB', status: 'Disponible', driver: 'Non assigné', image: 'https://images.unsplash.com/photo-1550359946009-3c5a650d39e?w=800&h=600&fit=crop' },
        { id: 9, name: 'Voiture B', type: 'SUV', plaque: 'TU-456-CD', status: 'En mission', location: 'Centre-ville', image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop' },
        { id: 10, name: 'Voiture C', type: 'Utilitaire', plaque: 'TU-789-EF', status: 'Disponible', driver: 'Non assigné', image: 'https://images.unsplash.com/photo-1550359946009-3c5a650d39e?w=800&h=600&fit=crop' }
      ],
      'Cabine Acoustique': [
        { id: 11, name: 'Cabine 1', size: 'Petite', equipment: 'Micros pro, Casques', status: 'Disponible', location: 'Étage -1', image: 'https://images.unsplash.com/photo-1560472359-c4119125a5a?w=800&h=600&fit=crop' },
        { id: 12, name: 'Cabine 2', size: 'Moyenne', equipment: 'Console audio, Micros', status: 'Occupée', location: 'Étage -1', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop' },
        { id: 13, name: 'Cabine 3', size: 'Grande', equipment: 'Studio complet', status: 'Disponible', location: 'Étage -1', image: 'https://images.unsplash.com/photo-1560472359-c4119125a5a?w=800&h=600&fit=crop' }
      ],
      'Les Réunions en Ligne': [
        { id: 14, name: 'Salle Virtuelle 1', capacity: 50, platform: 'Zoom', status: 'Disponible', features: 'Enregistrement, Chat', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e684a?w=800&h=600&fit=crop' },
        { id: 15, name: 'Salle Virtuelle 2', capacity: 100, platform: 'Teams', status: 'Occupée', features: 'Partage écran, Tableau blanc', image: 'https://images.unsplash.com/photo-1587593813293-fb92e44c07e1?w=800&h=600&fit=crop' },
        { id: 16, name: 'Salle Virtuelle 3', capacity: 25, platform: 'Google Meet', status: 'Disponible', features: 'Enregistrement', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e684a?w=800&h=600&fit=crop' }
      ]
    }
  };

  useEffect(() => {
    // Get category from URL hash and decode it properly
    const hash = window.location.hash;
    if (hash.startsWith('#resources-')) {
      const categoryName = decodeURIComponent(hash.replace('#resources-', ''));
      setCategory(categoryName);
      setResources(mockDatabase.resources[categoryName] || []);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setNewResource({...newResource, image: ''});
  };

  const handleAddResource = () => {
    if (newResource.name.trim()) {
      const id = Math.max(...resources.map(r => r.id), 0) + 1;
      let imageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&h=600&fit=crop`;
      
      // Use uploaded image if available
      if (imagePreview) {
        imageUrl = imagePreview;
      }
      
      const resourceToAdd = { ...newResource, id, image: imageUrl };
      setResources([...resources, resourceToAdd]);
      setNewResource({
        name: '',
        type: '',
        capacity: '',
        equipment: '',
        status: 'Disponible',
        location: '',
        driver: '',
        features: ''
      });
      setShowAddResource(false);
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setNewResource({
      name: resource.name,
      type: resource.type || '',
      capacity: resource.capacity || '',
      equipment: resource.equipment || '',
      status: resource.status,
      location: resource.location || '',
      driver: resource.driver || '',
      features: resource.features || ''
    });
    setShowAddResource(true);
  };

  const handleUpdateResource = () => {
    if (editingResource && newResource.name.trim()) {
      setResources(resources.map(res => 
        res.id === editingResource.id 
          ? { ...res, ...newResource }
          : res
      ));
      setEditingResource(null);
      setNewResource({
        name: '',
        type: '',
        capacity: '',
        equipment: '',
        status: 'Disponible',
        location: '',
        driver: '',
        features: ''
      });
      setShowAddResource(false);
    }
  };

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      setResources(resources.filter(res => res.id !== resourceId));
    }
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    setNewResource({
      name: '',
      type: '',
      capacity: '',
      equipment: '',
      status: 'Disponible',
      location: '',
      driver: '',
      features: ''
    });
    setShowAddResource(false);
  };

  const statusColor = {
    'Disponible': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Occupée': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'En mission': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.hash = '#resources'}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ← Retour aux catégories
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {category}
            </h1>
          </div>
          <button
            onClick={() => setShowAddResource(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg"
          >
            Ajouter une ressource
          </button>
        </div>

        {/* Add/Edit Resource Form */}
        {showAddResource && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {editingResource ? 'Modifier la ressource' : 'Ajouter une ressource'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="Nom de la ressource"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                <input
                  type="text"
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="Type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Capacité</label>
                <input
                  type="text"
                  value={newResource.capacity}
                  onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="Capacité"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Équipement</label>
                <input
                  type="text"
                  value={newResource.equipment}
                  onChange={(e) => setNewResource({ ...newResource, equipment: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="Équipement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                <select
                  value={newResource.status}
                  onChange={(e) => setNewResource({ ...newResource, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Occupée">Occupée</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="En mission">En mission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Localisation</label>
                <input
                  type="text"
                  value={newResource.location}
                  onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="Localisation"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image de la ressource</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex-1">
                    <div 
                      onClick={() => document.getElementById('resource-file-input').click()}
                      className="w-full aspect-[4/3] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all overflow-hidden bg-white dark:bg-slate-900"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-slate-400">📷</span>
                      )}
                    </div>
                    <input 
                      id="resource-file-input"
                      type="file" 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  
                  {/* Delete Image Button */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer l'image
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex gap-3">
                {editingResource ? (
                  <>
                    <button
                      onClick={handleUpdateResource}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                      Mettre à jour
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddResource}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Ajouter la ressource
                  </button>
                )}
              </div>
          </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-[0_35px_70px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                <img 
                  src={resource.image || 'https://images.unsplash.com/photo-1497366216642-4d6f658d747?w=800&h=600&fit=crop'} 
                  alt={resource.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1497366216642-4d6f658d747?w=800&h=600&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {resource.name}
                  </h3>
                </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditResource(resource)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
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

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[resource.status] || 'bg-gray-100 text-gray-800'}`}>
                    {resource.status}
                  </span>
                  <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all">
                    Réserver
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
      </div>
  )
}
