import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../landing/ThemeToggle';
import { LanguageSwitcher } from '../landing/LanguageSwitcher';
import { uploadImageToBackend } from '../../utils/cloudinary';
import { ReservationCalendar } from '../calendar/ReservationCalendar';
import { ReservationModal } from '../calendar/ReservationModal';

export const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Check if user has CRUD permissions (admins and managers can CRUD equipment)
  const canManageEquipment = user?.role === 'admin';
  
  // Check if user can make reservations (only users can make reservations)
  const canMakeReservation = user?.role === 'user';

  // Determine category type based on resource name
  const getCategoryType = (resourceName) => {
    const name = resourceName?.toLowerCase() || '';
    if (name.includes('flotte') || name.includes('véhicule') || name.includes('vehicule')) {
      return 'vehicules';
    }
    if (name.includes('salle')) {
      return 'salles';
    }
    return 'equipement';
  };

  // Determine labels based on resource name
  const getTypeConfig = (resourceName) => {
    const name = resourceName?.toLowerCase() || '';
    if (name.includes('flotte') || name.includes('véhicule') || name.includes('vehicule')) {
      return {
        itemLabel: 'un véhicule',
        itemsLabel: 'Véhicules',
        addLabel: '+ Ajouter un véhicule',
        editLabel: 'Modifier le véhicule',
        createLabel: 'Créer le véhicule',
        emptyIcon: '🚗',
        emptyText: 'Aucun véhicule trouvé pour cette flotte',
        headerLabel: 'Détails Flotte',
      };
    }
    if (name.includes('salle')) {
      return {
        itemLabel: 'une salle',
        itemsLabel: 'Salles',
        addLabel: '+ Ajouter une salle',
        editLabel: 'Modifier la salle',
        createLabel: 'Créer la salle',
        emptyIcon: '🏢',
        emptyText: 'Aucune salle trouvée',
        headerLabel: 'Détails Salles',
      };
    }
    return {
      itemLabel: 'un équipement',
      itemsLabel: 'Équipements',
      addLabel: '+ Ajouter un équipement',
      editLabel: "Modifier l'équipement",
      createLabel: "Créer l'équipement",
      emptyIcon: '🖥️',
      emptyText: 'Aucun équipement trouvé pour cette ressource',
      headerLabel: 'Détails Équipements',
    };
  };

  const typeConfig = getTypeConfig(resource?.name);

  const [formData, setFormData] = useState({ 
    nom: '', details: '', image_url: '' 
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTimeEnd, setSelectedTimeEnd] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenEdit = (item) => {
    setIsEditing(item.id_equipement);
    setFormData({ 
      nom: item.nom, 
      details: item.details,
      image_url: item.image_url || ''
    });
    setImagePreview(item.image_url || null);
    setIsModalOpen(true);
  };

  const handleCalendarClick = (item) => {
    setSelectedEquipment(item);
    setShowCalendar(true);
  };

  const handleReservationClick = (date, time, timeEnd) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedTimeEnd(timeEnd || null);
    setShowReservationModal(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
    setSelectedEquipment(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedTimeEnd(null);
  };

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
    if (isEditing) {
      setFormData({...formData, image_url: ''});
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = formData.image_url || null;
      
      // Upload image to Cloudinary if a new file is selected
      if (selectedFile) {
        imageUrl = await uploadImageToBackend(selectedFile);
      }

      const dataToSave = {
        nom: formData.nom,
        details: formData.details,
        image_url: imageUrl === '' ? null : imageUrl
      };

      if (isEditing) {
        await axios.put(`http://localhost:3000/api/equipement/${isEditing}`, dataToSave);
      } else {
        await axios.post(`http://localhost:3000/api/resources/${id}/equipment`, dataToSave);
      }
      closeModal();
      fetchData();
    } catch (err) { 
      console.error(err); 
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet équipement ?")) {
      try {
        await axios.delete(`http://localhost:3000/api/equipement/${itemId}`);
        fetchData();
      } catch (err) { 
        console.error(err); 
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(null);
    setFormData({ nom: '', details: '', image_url: '' });
    setImagePreview(null);
    setSelectedFile(null);
  };

  const fetchData = async () => {
    try {
      // Get resource details
      const resourceResponse = await axios.get(`http://localhost:3000/api/resources/${id}`);
      setResource(resourceResponse.data);

      // Get equipment for this resource
      const equipmentResponse = await axios.get(`http://localhost:3000/api/resources/${id}/equipment`);
      setEquipment(equipmentResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ressource non trouvée</h2>
            <Link to="/accueil" className="text-blue-600 dark:text-blue-400 hover:underline">
              Retour à l'inventaire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500">
      <div className="flex-1 flex flex-col">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-40 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/accueil')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="text-lg">×</span>
              <span>Retour</span>
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{typeConfig.headerLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            {canManageEquipment && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-200/20 dark:border-slate-700/20"
              >
                {typeConfig.addLabel}
              </button>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full">
          {/* Resource Header */}
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              {resource.image_url && (
                <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-lg">
                  <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{resource.name}</h1>
                <p className="text-slate-600 dark:text-slate-400">{resource.description || 'Aucune description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {equipment.length} {typeConfig.itemsLabel.toLowerCase().slice(0, -1)}{equipment.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Equipment List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{typeConfig.itemsLabel} associé(e)s</h2>
            
            {equipment.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                <div className="text-6xl mb-4 opacity-20">{typeConfig.emptyIcon}</div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">{typeConfig.emptyText}</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Les éléments apparaîtront ici une fois ajoutés</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {equipment.map((item) => (
                  <div key={item.id_equipement} className="group relative h-96 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:scale-105 hover:shadow-3xl cursor-pointer">
                    
                    {/* Background Image with Blur Overlay */}
                    <div className="absolute inset-0">
                      {item.image_url ? (
                        <>
                          <img 
                            src={item.image_url} 
                            className="w-full h-full object-cover"
                            alt={item.nom}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent backdrop-blur-[1px]" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                      )}
                    </div>

                    {/* Floating Actions (Visible on Hover) */}
                    <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
                      {canMakeReservation && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCalendarClick(item); }}
                          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 backdrop-blur-md flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all text-white border border-blue-400/20"
                          title="Voir les réservations"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {canManageEquipment && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                            className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 backdrop-blur-md flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all text-white border border-emerald-400/20"
                            title="Modifier l'équipement"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id_equipement); }}
                            className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 backdrop-blur-md flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all text-white border border-red-400/20"
                            title="Supprimer l'équipement"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl font-black mb-2 drop-shadow-lg">{item.nom}</h3>
                      <p className="text-white/90 text-sm font-medium line-clamp-2 drop-shadow">{item.details || "Aucun détail disponible"}</p>
                    </div>

                    {/* Icon for items without image */}
                    {!item.image_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl text-white/20">{typeConfig.emptyIcon}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Calendar Modal */}
        {showCalendar && selectedEquipment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-7xl max-h-[85vh] rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  Réservations - {selectedEquipment.nom}
                </h2>
                <button 
                  onClick={closeCalendar}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-2xl hover:scale-110"
                >
                  ×
                </button>
              </div>
              
              {/* Calendar Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <ReservationCalendar 
                  equipmentId={selectedEquipment.id_equipement}
                  equipmentName={selectedEquipment.nom}
                  onReservationClick={handleReservationClick}
                  canMakeReservation={canMakeReservation}
                  categoryType={getCategoryType(selectedEquipment.nom)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Equipment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] shadow-2xl border border-white/10 flex overflow-hidden max-h-[90vh]">
              
              {/* Visual Column */}
              <div className="w-5/12 bg-slate-50 dark:bg-slate-800/50 p-12 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800">
                <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[3.5rem] flex items-center justify-center cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all overflow-hidden bg-white dark:bg-slate-900">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" /> : <span className="text-6xl opacity-10">{typeConfig.emptyIcon}</span>}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Image</p>
                
                {/* Delete Picture Button */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer l'image
                  </button>
                )}
              </div>

              {/* Content Column */}
              <div className="w-7/12 p-16 overflow-y-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    {isEditing ? typeConfig.editLabel : typeConfig.addLabel.replace('+ ', '')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isEditing ? `Mettre à jour les informations` : `Ajouter ${typeConfig.itemLabel} à cette ressource`}
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none font-bold dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all" 
                      value={formData.nom} 
                      onChange={e => setFormData({...formData, nom: e.target.value})}
                      placeholder={`Nom ${typeConfig.itemLabel}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Détails</label>
                    <textarea 
                      className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none font-bold dark:text-white outline-none h-32 resize-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all" 
                      value={formData.details} 
                      onChange={e => setFormData({...formData, details: e.target.value})}
                      placeholder="Description de l'équipement..."
                    />
                  </div>

                  <div className="flex gap-6 pt-8">
                    <button type="button" onClick={closeModal} className="flex-1 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Annuler</button>
                    <button type="submit" disabled={uploading} className="flex-1 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploading ? 'Téléchargement...' : (isEditing ? 'Sauvegarder' : typeConfig.createLabel)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Modal */}
        {showReservationModal && selectedEquipment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <ReservationModal 
              isOpen={showReservationModal}
              onClose={() => setShowReservationModal(false)}
              equipment={selectedEquipment}
              resourceId={id ? parseInt(id) : undefined}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedTimeEnd={selectedTimeEnd}
            />
          </div>
        )}
      </div>
    </div>
  );
};
