import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const ReservationModal = ({ isOpen, onClose, equipment, selectedDate, selectedTime, selectedTimeEnd, resourceId, categoryType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_equipement: equipment?.id || '',
    id_user: '',
    date_reservation: selectedDate ? 
      `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : 
      '',
    time_start: selectedTime || '09:00',
    time_end: selectedTime ? (parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : '10:00',
    nombre_personnes: 1
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [availableEquipments, setAvailableEquipments] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  
  // Invitation system state
  const [invitationType, setInvitationType] = useState('internal');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedInternalUsers, setSelectedInternalUsers] = useState([]);
  const [externalEmails, setExternalEmails] = useState(['']);

  // Determine if we should show equipment selection (only for salles)
  const showEquipmentSelection = categoryType === 'salles';

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({ ...prev, id_user: parsedUser.id }));
    }

    // Fetch equipment only for salles
    if (showEquipmentSelection) {
      fetchEquipmentsFromCategory();
    }
  }, [showEquipmentSelection]);

  useEffect(() => {
    // Fetch users only when user is available
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      // Filter out admin users and current user, show other regular users
      const availableForInvitation = response.data.filter(u => 
        u.role !== 'admin' && u.id !== user?.id
      );
      setAvailableUsers(availableForInvitation);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEquipmentsFromCategory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/equipements');
      console.log('=== DEBUG FRONTEND EQUIPEMENTS ===');
      console.log('Tous les équipements reçus:', response.data);
      // Filter to only show equipment from Équipements category (ID 3), not salles
      const equipmentOnly = response.data.filter(equip => equip.category_id === 3);
      console.log('Équipements filtrés (catégorie 3):', equipmentOnly);
      setAvailableEquipments(equipmentOnly);
    } catch (error) {
      console.error('Error fetching equipment from category:', error);
    }
  };

  useEffect(() => {
    // Update form data when selectedDate or selectedTime changes
    if (selectedDate) {
      // Use local date formatting to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const newDate = `${year}-${month}-${day}`;
      
      // selectedTime can now be "HH:MM" start, and selectedTimeEnd passed separately
      const newTimeStart = selectedTime || '09:00';
      const newTimeEnd = selectedTimeEnd || (() => {
        if (!selectedTime) return '10:00';
        const [h, m] = selectedTime.split(':').map(Number);
        const endH = h + 1;
        return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      })();
      
      setFormData(prev => ({
        ...prev,
        date_reservation: newDate,
        time_start: newTimeStart,
        time_end: newTimeEnd
      }));
    }
  }, [selectedDate, selectedTime, selectedTimeEnd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get all equipment IDs: the main one + selected additional ones
      const allEquipmentIds = [formData.id_equipement, ...selectedEquipments].filter(Boolean);
      
      // Filter valid external emails with better validation
      const validExternalEmails = externalEmails.filter(email => {
        return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      });
      
      // Remove duplicates
      const uniqueExternalEmails = [...new Set(validExternalEmails)];
      
      // Calculate total participants
      const totalParticipants = 1 + selectedInternalUsers.length + uniqueExternalEmails.length;
      
      console.log('=== DEBUG RESERVATION ===');
      console.log('formData:', formData);
      console.log('allEquipmentIds:', allEquipmentIds);
      console.log('selectedInternalUsers:', selectedInternalUsers);
      console.log('uniqueExternalEmails:', uniqueExternalEmails);
      console.log('totalParticipants:', totalParticipants);
      
      if ((selectedInternalUsers.length > 0 || uniqueExternalEmails.length > 0)) {
        // Create reservation with invitations
        const reservationData = {
          id_equipement: equipment?.id,
          id_user: formData.id_user,
          date_reservation: formData.date_reservation,
          time_start: formData.time_start,
          time_end: formData.time_end,
          internal_users: selectedInternalUsers,
          external_emails: uniqueExternalEmails,
          additional_equipments: selectedEquipments, // Only additional equipments
          nombre_personnes: totalParticipants
        };
        console.log('Sending reservation with invitations:', reservationData);
        await axios.post('http://localhost:3000/api/reservations/with-invitations', reservationData);
      } else {
        // Single reservation without invitations
        const reservationData = {
          id_equipement: equipment?.id,
          id_user: formData.id_user,
          date_reservation: formData.date_reservation,
          time_start: formData.time_start,
          time_end: formData.time_end,
          additional_equipments: selectedEquipments, // Only additional equipments
          nombre_personnes: totalParticipants
        };
        
        // Validation des données
        if (!reservationData.id_equipement || !reservationData.id_user || !reservationData.date_reservation || !reservationData.time_start || !reservationData.time_end) {
          throw new Error('Données de réservation incomplètes');
        }
        
        console.log('Sending single reservation:', reservationData);
        await axios.post('http://localhost:3000/api/reservations', reservationData);
      }

      // Show success message
      const successMessage = (selectedInternalUsers.length > 0 || uniqueExternalEmails.length > 0)
        ? 'Réservation créée avec succès! Les invitations ont été envoyées par email.'
        : 'Réservation créée avec succès!';
      
      alert(successMessage);
      
      onClose();
      
      // Auto-reload and redirect to accueil after a short delay
      setTimeout(() => {
        window.location.reload(); // Reload to refresh data
        navigate('/accueil'); // Redirect to accueil
      }, 1500);
      
      // Reset form
      setFormData({
        id_equipement: '',
        id_user: user?.id || '',
        date_reservation: '',
        time_start: '09:00',
        time_end: '10:00',
        nombre_personnes: 1
      });
      setSelectedEquipments([]);
      setSelectedInternalUsers([]);
      setExternalEmails(['']);
      setInvitationType('internal');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la création de la réservation: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentToggle = (equipmentId) => {
    setSelectedEquipments(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[85vh] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-center p-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {selectedDate ? `Réservation - ${selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' })}` : 'Nouvelle Réservation'}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* User Info - Compact */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                  {user?.prenom?.[0] || 'U'}{user?.nom?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Réservé par <span className="font-semibold">{user?.prenom || ''} {user?.nom || ''}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Participants: {1 + selectedInternalUsers.length + externalEmails.filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).length}
                </p>
              </div>
            </div>

            {/* Equipment Selection - Only for salles */}
            {showEquipmentSelection && availableEquipments.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">🔧 Équipement à réserver supplémentaire</h3>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Sélectionner des équipements (optionnel)
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800">
                    {availableEquipments.map(equipment => (
                      <label key={equipment.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEquipments.includes(equipment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEquipments([...selectedEquipments, equipment.id]);
                            } else {
                              setSelectedEquipments(selectedEquipments.filter(id => id !== equipment.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {equipment.nom}
                          </div>
                          {equipment.details && (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {equipment.details}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {selectedEquipments.length > 0 
                      ? `${selectedEquipments.length} équipement(s) sélectionné(s)`
                      : 'Vous pouvez sélectionner plusieurs équipements à réserver en plus de cette salle'
                    }
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">📧 Inviter des participants</h3>
              
              {/* Invitation Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setInvitationType('internal')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    invitationType === 'internal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Utilisateurs internes
                </button>
                <button
                  type="button"
                  onClick={() => setInvitationType('external')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    invitationType === 'external'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Invités externes
                </button>
              </div>

              {/* Internal User Selection */}
              {invitationType === 'internal' && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Sélectionner des utilisateurs internes
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                    {availableUsers.map(u => (
                      <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedInternalUsers.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInternalUsers([...selectedInternalUsers, u.id]);
                            } else {
                              setSelectedInternalUsers(selectedInternalUsers.filter(id => id !== u.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {u.prenom} {u.nom}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {u.email} • {u.role}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* External Email Input */}
              {invitationType === 'external' && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Adresses email des invités externes
                  </label>
                  <div className="space-y-3">
                    {externalEmails.map((email, index) => {
                      const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                      const isDuplicate = externalEmails.filter((e, i) => e && i !== index).includes(email);
                      
                      return (
                        <div key={index} className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...externalEmails];
                                newEmails[index] = e.target.value;
                                setExternalEmails(newEmails);
                              }}
                              placeholder="nom@example.com"
                              className={`flex-1 p-3 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                                email && !isValidEmail 
                                  ? 'border-red-300 focus:border-red-500' 
                                  : isDuplicate
                                  ? 'border-orange-300 focus:border-orange-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
                              }`}
                            />
                            {email && !isValidEmail && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            {email && isValidEmail && !isDuplicate && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {externalEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExternalEmails(externalEmails.filter((_, i) => i !== index));
                              }}
                              className="px-3 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer cet email"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setExternalEmails([...externalEmails, ''])}
                      className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter un email
                    </button>
                    
                    {/* Email validation hints */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p>• Entrez une adresse email valide (ex: nom@domaine.com)</p>
                      <p>• Les adresses en double seront automatiquement filtrées</p>
                      <p>• Les emails invalides ne seront pas inclus dans l'invitation</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Participants sélectionnés: {selectedInternalUsers.length + externalEmails.filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).length}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Réservation...' : 'Réserver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
