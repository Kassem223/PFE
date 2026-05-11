import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from '../landing/ThemeToggle';
import { LanguageSwitcher } from '../landing/LanguageSwitcher';
import { uploadImageToBackend } from '../../utils/cloudinary';
import { ReservationCalendar } from '../calendar/ReservationCalendar';
import { ReservationModal } from '../calendar/ReservationModal';

// Config per category type
const TYPE_CONFIG = {
  salles: {
    name: 'Salles',
    itemLabel: 'une salle',
    itemsLabel: 'Salles',
    addLabel: '+ Ajouter une salle',
    editLabel: 'Modifier la salle',
    createLabel: 'Créer la salle',
    emptyIcon: '🏢',
    emptyText: 'Aucune salle trouvée',
    headerLabel: 'Salles',
    dbName: 'Salles',
  },
  vehicules: {
    name: 'Véhicules',
    itemLabel: 'un véhicule',
    itemsLabel: 'Véhicules',
    addLabel: '+ Ajouter un véhicule',
    editLabel: 'Modifier le véhicule',
    createLabel: 'Créer le véhicule',
    emptyIcon: '🚗',
    emptyText: 'Aucun véhicule trouvé',
    headerLabel: 'Véhicules',
    dbName: 'Véhicules',
  },
  equipement: {
    name: 'Équipements',
    itemLabel: 'un équipement',
    itemsLabel: 'Équipements',
    addLabel: '+ Ajouter un équipement',
    editLabel: "Modifier l'équipement",
    createLabel: "Créer l'équipement",
    emptyIcon: '🖥️',
    emptyText: 'Aucun équipement trouvé',
    headerLabel: 'Équipements',
    dbName: 'Équipements',
  },
};

export const CategoryPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.equipement;

  const [resourceId, setResourceId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ nom: '', details: '', image_url: '', categoryKey: type });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTimeEnd, setSelectedTimeEnd] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log('User loaded:', parsedUser);
      console.log('User role:', parsedUser?.role);
      console.log('Can reserve:', parsedUser?.role === 'user');
    } else {
      console.log('No user found in localStorage');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [type]);

  const canManage = user?.role === 'admin';
  const canReserve = user?.role === 'user';

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      
      // Utiliser les nouvelles routes selon le type
      if (type === 'salles') {
        response = await axios.get('http://localhost:3000/api/salles');
      } else if (type === 'vehicules') {
        response = await axios.get('http://localhost:3000/api/vehicules');
      } else {
        response = await axios.get('http://localhost:3000/api/equipements');
      }
      
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    // Utiliser le bon ID selon le type
    const itemId = type === 'salles' ? item.id : type === 'vehicules' ? item.id : item.id;
    setIsEditing(itemId);
    setFormData({ nom: item.nom, details: item.details, image_url: item.image_url || '', categoryKey: type });
    setImagePreview(item.image_url || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (isEditing) setFormData({ ...formData, image_url: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation: seulement le nom est obligatoire
    if (!formData.nom || formData.nom.trim() === '') {
      alert('Le nom est obligatoire');
      return;
    }
    
    setUploading(true);
    try {
      let imageUrl = formData.image_url || null;
      if (selectedFile) imageUrl = await uploadImageToBackend(selectedFile);

      // Récupérer l'ID de la catégorie
      const categoryRes = await axios.get('http://localhost:3000/api/categories');
      const category = categoryRes.data.find(c => c.name === config.dbName);
      
      if (!category) {
        alert(`La catégorie "${config.name}" n'existe pas encore en base de données.`);
        setUploading(false);
        return;
      }

      const dataToSave = {
        category_id: category.id,
        nom: formData.nom,
        details: formData.details || '', // Envoyer chaîne vide au lieu de null
        image_url: imageUrl === '' ? null : imageUrl,
      };

      // Utiliser les nouvelles routes selon le type
      if (type === 'salles') {
        if (isEditing) {
          await axios.put(`http://localhost:3000/api/salles/${isEditing}`, dataToSave);
        } else {
          await axios.post('http://localhost:3000/api/salles', dataToSave);
        }
      } else if (type === 'vehicules') {
        if (isEditing) {
          await axios.put(`http://localhost:3000/api/vehicules/${isEditing}`, dataToSave);
        } else {
          await axios.post('http://localhost:3000/api/vehicules', dataToSave);
        }
      } else {
        if (isEditing) {
          await axios.put(`http://localhost:3000/api/equipements/${isEditing}`, dataToSave);
        } else {
          await axios.post('http://localhost:3000/api/equipements', dataToSave);
        }
      }
      
      closeModal();
      // If we saved to a different category, navigate there
      if (formData.categoryKey !== type) {
        navigate(`/category/${formData.categoryKey}`);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm(`Voulez-vous vraiment supprimer cet élément ?`)) {
      try {
        // Utiliser les nouvelles routes selon le type
        if (type === 'salles') {
          await axios.delete(`http://localhost:3000/api/salles/${itemId}`);
        } else if (type === 'vehicules') {
          await axios.delete(`http://localhost:3000/api/vehicules/${itemId}`);
        } else {
          await axios.delete(`http://localhost:3000/api/equipements/${itemId}`);
        }
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(null);
    setFormData({ nom: '', details: '', image_url: '', categoryKey: type });
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleCalendarClick = (item) => {
    console.log('handleCalendarClick called with item:', item);
    console.log('User role:', user?.role);
    console.log('canReserve:', canReserve);
    setSelectedItem(item);
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
    setSelectedItem(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedTimeEnd(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500">
      <div className="flex-1 flex flex-col">

        {/* Header */}
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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{config.headerLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-200/20 dark:border-slate-700/20"
              >
                {config.addLabel}
              </button>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Main */}
        <main className="p-10 max-w-7xl mx-auto w-full">
          {/* Page title */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{config.name}</h1>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {items.length} {items.length > 1 ? config.itemsLabel.toLowerCase() : config.itemLabel}
            </span>
          </div>

          {/* Items grid */}
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-7xl mb-4 opacity-20">{config.emptyIcon}</div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">{config.emptyText}</p>
              {canManage && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
                >
                  {config.addLabel}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item.id} className="group relative h-96 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:scale-105 hover:shadow-3xl cursor-pointer">

                  {/* Background */}
                  <div className="absolute inset-0">
                    {item.image_url ? (
                      <>
                        <img 
                          src={item.image_url} 
                          className="w-full h-full object-cover object-center object-top" 
                          alt={item.nom}
                          loading="eager"
                          decoding="async"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                    )}
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
                    {console.log('Rendering button - canReserve:', canReserve, 'user:', user, 'user.role:', user?.role)}
                    {canReserve && (
                      <button
                        onClick={(e) => { 
                          console.log('Reserve button clicked'); 
                          e.stopPropagation(); 
                          handleCalendarClick(item); 
                        }}
                        className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-xl hover:scale-105 transition-all text-white font-semibold text-sm"
                        title="Réserver"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Réserver
                      </button>
                    )}
                    {!user && (
                      <div className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded">
                        Non connecté
                      </div>
                    )}
                    {canManage && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                          className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl hover:scale-110 transition-all text-white"
                          title="Modifier"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl hover:scale-110 transition-all text-white"
                          title="Supprimer"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-black mb-2 drop-shadow-lg">{item.nom}</h3>
                    <p className="text-white/90 text-sm font-medium line-clamp-2 drop-shadow">{item.details || 'Aucun détail disponible'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Calendar Modal */}
        {showCalendar && selectedItem && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-7xl max-h-[85vh] rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  Réservations — {selectedItem.nom}
                </h2>
                <button onClick={closeCalendar} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-2xl hover:scale-110">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ReservationCalendar
                  equipmentId={selectedItem.id}
                  equipmentName={selectedItem.nom}
                  onReservationClick={handleReservationClick}
                  canMakeReservation={canReserve}
                  categoryType={type}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] shadow-2xl border border-white/10 flex overflow-hidden max-h-[90vh]">

              {/* Visual Column */}
              <div className="w-5/12 bg-slate-50 dark:bg-slate-800/50 p-12 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[3.5rem] flex items-center justify-center cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all overflow-hidden bg-white dark:bg-slate-900"
                >
                  {imagePreview
                    ? <img 
                        src={imagePreview} 
                        className="w-full h-full object-cover object-center object-top" 
                        alt="preview"
                        loading="eager"
                        decoding="async"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    : <span className="text-6xl opacity-10">{config.emptyIcon}</span>
                  }
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Couverture visuelle</p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="mt-4 h-10 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                )}
              </div>

              {/* Form Column */}
              <div className="w-7/12 p-16 overflow-y-auto">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {isEditing ? config.editLabel : config.addLabel.replace('+ ', '')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  {isEditing ? 'Mettre à jour les informations' : `Ajouter ${config.itemLabel}`}
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none font-bold dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                      value={formData.nom}
                      onChange={e => setFormData({ ...formData, nom: e.target.value })}
                      placeholder={`Nom ${config.itemLabel}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Détails</label>
                    <textarea
                      className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none font-bold dark:text-white outline-none h-32 resize-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                      value={formData.details}
                      onChange={e => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Description (optionnel)..."
                    />
                  </div>
                  <div className="flex gap-6 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Téléchargement...' : (isEditing ? 'Sauvegarder' : config.createLabel)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Modal */}
        {showReservationModal && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <ReservationModal
              isOpen={showReservationModal}
              onClose={() => setShowReservationModal(false)}
              equipment={selectedItem}
              resourceId={resourceId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedTimeEnd={selectedTimeEnd}
              categoryType={type}
            />
          </div>
        )}
      </div>
    </div>
  );
};
