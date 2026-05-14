import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, UserPlus, Mail, Settings, X, Package, MapPin, Navigation, FileText, Zap, MessageSquare, Briefcase } from 'lucide-react';

export const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedReservation, setExpandedReservation] = useState(null);
  const [invitations, setInvitations] = useState({});
  const [equipments, setEquipments] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'annulée', 'active'

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserReservations(parsedUser.id);
    }
  }, []);

  const getReservationGroupKey = (reservation) => {
    return `${reservation.date_reservation}_${reservation.time_start}_${reservation.time_end}`;
  };

  const fetchUserReservations = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/user/${userId}`);
      
      // Group reservations by date_reservation, time_start, and time_end
      // This handles multi-equipment reservations that create multiple rows
      const groupedReservations = {};
      response.data.forEach(reservation => {
        const key = `${reservation.date_reservation}_${reservation.time_start}_${reservation.time_end}`;
        if (!groupedReservations[key]) {
          groupedReservations[key] = {
            ...reservation,
            equipments: [],
            all_ids: [] // store all reservation IDs in this group
          };
        }
        groupedReservations[key].equipments.push({
          id_equipement: reservation.id_equipement,
          equipement_nom: reservation.equipement_nom,
          equipement_status: reservation.equipement_status
        });
        groupedReservations[key].all_ids.push(reservation.id_reservation || reservation.id);
      });
      
      // Convert grouped object to array and use first reservation ID as main
      const processedReservations = Object.values(groupedReservations).map(group => ({
        ...group,
        additional_equipments: group.equipments.slice(1) // All equipments after the first
      }));
      
      setReservations(processedReservations);
      setLoading(false);

      // Bulk fetch invitations so accepted counts display immediately
      const allIds = processedReservations.flatMap(r => r.all_ids || [r.id_reservation || r.id]);
      if (allIds.length > 0) {
        try {
          const invResponse = await axios.get(`http://localhost:3000/api/reservations/invitations?ids=${allIds.join(',')}`);
          const newInvitations = {};
          
          const idToGroupKey = {};
          processedReservations.forEach(res => {
            const groupKey = getReservationGroupKey(res);
            const ids = res.all_ids || [res.id_reservation || res.id];
            ids.forEach(id => { idToGroupKey[id] = groupKey; });
          });

          invResponse.data.forEach(inv => {
            const groupKey = idToGroupKey[inv.id_reservation];
            if (groupKey) {
              if (!newInvitations[groupKey]) newInvitations[groupKey] = [];
              newInvitations[groupKey].push(inv);
            }
          });
          
          setInvitations(prev => ({ ...prev, ...newInvitations }));
        } catch (err) {
          console.error('Error fetching invitations in bulk:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setLoading(false);
    }
  };


  // Fetch invitations for all reservation IDs in a group
  const fetchInvitations = async (reservation, groupKey) => {
    const groupIds = reservation.all_ids || [reservation.id_reservation || reservation.id];
    console.log(`Fetching invitations for group ${groupKey} with IDs:`, groupIds);
    if (groupIds.length === 0) return;
    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/invitations?ids=${groupIds.join(',')}`);
      setInvitations(prev => ({
        ...prev,
        [groupKey]: response.data
      }));
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Fetch equipments for a reservation
  const fetchEquipments = async (reservationId, groupKey) => {
    try {
      console.log('Fetching equipments for reservation:', reservationId);
      const response = await axios.get(`http://localhost:3000/api/reservations/${reservationId}/equipments`);
      console.log('Equipments response:', response.data);
      setEquipments(prev => ({
        ...prev,
        [groupKey]: response.data
      }));
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  };

  const toggleReservationDetails = (reservation) => {
    const groupKey = getReservationGroupKey(reservation);
    console.log('Toggling details for group:', groupKey);
    if (expandedReservation === groupKey) {
      setExpandedReservation(null);
    } else {
      setExpandedReservation(groupKey);
      if (!invitations[groupKey]) {
        console.log('Invitations not in state, fetching...');
        fetchInvitations(reservation, groupKey);
      } else {
        console.log('Invitations already in state:', invitations[groupKey]);
      }
      if (!equipments[groupKey]) {
        fetchEquipments(reservation.id_reservation || reservation.id, groupKey);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'confirmée':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'annulée':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'terminée':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_attente': return <AlertCircle className="w-4 h-4" />;
      case 'confirmée': return <CheckCircle className="w-4 h-4" />;
      case 'annulée': return <XCircle className="w-4 h-4" />;
      case 'terminée': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getInvitationStatusIcon = (status) => {
    switch (status) {
      case 'acceptée':
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'refusée':
      case 'refused': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'en_attente':
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getInvitationStatusText = (status) => {
    switch (status) {
      case 'acceptée':
      case 'accepted': return 'Acceptée';
      case 'refusée':
      case 'refused': return 'Refusée';
      case 'en_attente':
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getAcceptedCount = (groupKey) => {
    const groupInvitations = invitations[groupKey];
    if (!groupInvitations) return 0;
    return groupInvitations.filter(invitation => 
      invitation.statut === 'acceptée' || invitation.statut === 'accepted'
    ).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const handleCancelReservation = async (reservation) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      try {
        // Use all_ids stored in the group to cancel every reservation row
        const idsToCancel = reservation.all_ids?.length > 0
          ? reservation.all_ids
          : [reservation.id_reservation || reservation.id];

        for (const id of idsToCancel) {
          await axios.put(`http://localhost:3000/api/reservations/${id}/cancel`, {
            type: reservation.category_type
          });
        }

        // Update local state — mark as annulée instead of removing
        const keyId = reservation.id_reservation || reservation.id;
        setReservations(prev =>
          prev.map(res =>
            (res.id_reservation || res.id) === keyId
              ? { ...res, statut: 'annulée' }
              : res
          )
        );
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Erreur lors de l\'annulation. Veuillez réessayer.');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Veuillez vous connecter pour voir vos réservations
          </h2>
          <Link 
            to="/login"
            style={{ display: 'inline-block', cursor: 'pointer' }}
            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors select-none"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            
            {/* Filter Controls */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'active' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Actives
              </button>
              <button
                onClick={() => setFilterStatus('annulée')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'annulée' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Annulées
              </button>
            </div>
          </div>

          {/* Reservations List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-600 animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Chargement de vos réservations...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Aucune réservation trouvée
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Vous n'avez pas encore de réservation. Commencez par réserver un équipement pour voir vos réservations ici.
              </p>
              <Link 
                to="/accueil"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-5 h-5" />
                Réserver un équipement
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations
                .filter(reservation => {
                  if (filterStatus === 'all') return true;
                  if (filterStatus === 'active') return reservation.statut !== 'annulée';
                  if (filterStatus === 'annulée') return reservation.statut === 'annulée';
                  return true;
                })
                .map((reservation) => (
                <div 
                  key={reservation.id_reservation || reservation.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header with Status */}
                  <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(reservation.statut)}`}>
                          {getStatusIcon(reservation.statut)}
                          {reservation.statut === 'en_attente' ? 'En attente' : 
                           reservation.statut === 'confirmée' ? 'Confirmée' :
                           reservation.statut === 'annulée' ? 'Annulée' : 'Terminée'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          #{reservation.id_reservation || reservation.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {reservation.statut !== 'annulée' && (
                          <button 
                            onClick={() => handleCancelReservation(reservation)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        )}
                        <button
                          onClick={() => toggleReservationDetails(reservation)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          {expandedReservation === getReservationGroupKey(reservation) ? 'Masquer' : 'Détails'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Resource Card with Photo and Name */}
                    <div className="mb-6 flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {reservation.resource_image ? (
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          <img 
                            src={reservation.resource_image} 
                            alt={reservation.resource_nom}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          <Package className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {reservation.resource_nom}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span className="font-semibold">{reservation.category_type === 'salles' ? 'Salle' : reservation.category_type === 'vehicules' ? 'Véhicule' : 'Équipement'}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatDate(reservation.date_reservation)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Durée</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatTime(reservation.time_start)} - {formatTime(reservation.time_end)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Participants</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {(() => {
                              const groupKey = getReservationGroupKey(reservation);
                              const totalInvited = reservation.nombre_personnes;
                              const acceptedCount = getAcceptedCount(groupKey);
                              return `${totalInvited} personne${totalInvited > 1 ? 's' : ''} (${acceptedCount} ont accepté)`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Expandable Details Section */}
                    {expandedReservation === getReservationGroupKey(reservation) && (
                      <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 space-y-4">
                        {/* Equipments Section - Only show for salles */}
                        {reservation.category_type === 'salles' && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                              </div>
                              Équipements réservés ({(equipments[getReservationGroupKey(reservation)]?.length || 0)})
                            </h4>
                            {equipments[getReservationGroupKey(reservation)]?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {equipments[getReservationGroupKey(reservation)]?.map((equipment, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {equipment.nom}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-9">Aucun équipement supplémentaire</p>
                            )}
                          </div>
                        )}
                        {/* Note Section - Only for salles */}
                        {reservation.category_type === 'salles' && reservation.note && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              Note
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg px-3 py-2 ml-9 leading-relaxed">
                              {reservation.note}
                            </p>
                          </div>
                        )}

                        {/* Invitations Section - Only for Salles */}
                        {reservation.category_type === 'salles' && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                                <Mail className="w-4 h-4 text-white" />
                              </div>
                              Invitations ({invitations[getReservationGroupKey(reservation)]?.length || 0})
                            </h4>
                            {invitations[getReservationGroupKey(reservation)] && invitations[getReservationGroupKey(reservation)].length > 0 ? (
                              <div className="space-y-2 ml-9">
                                {invitations[getReservationGroupKey(reservation)].map((invitation, index) => (
                                  <div key={index} className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {invitation.email || `${invitation.prenom} ${invitation.nom}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {getInvitationStatusIcon(invitation.statut)}
                                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        {getInvitationStatusText(invitation.statut)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-9">Aucune invitation pour cette réservation</p>
                            )}
                          </div>
                        )}

                        {/* Vehicle Details Section - Only for Vehicules */}
                        {reservation.category_type === 'vehicules' && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-white" />
                              </div>
                              Détails du trajet
                            </h4>
                            <div className="ml-9 grid grid-cols-2 gap-2">
                              {reservation.vehicle_motif && (
                                <div className="col-span-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5">Motif</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_motif}</p>
                                </div>
                              )}
                              {reservation.vehicle_depart && (
                                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/>Départ</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_depart}</p>
                                </div>
                              )}
                              {reservation.vehicle_destination && (
                                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><Navigation className="w-3 h-3"/>Destination</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_destination}</p>
                                </div>
                              )}
                              {reservation.vehicle_distance && (
                                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><Zap className="w-3 h-3"/>Distance</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_distance} km</p>
                                </div>
                              )}
                              {reservation.vehicle_note && (
                                <div className="col-span-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3"/>Note</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{reservation.vehicle_note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className="flex items-center gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                          <span>Créée le {new Date(reservation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(reservation.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="ml-auto flex items-center gap-1">
                            {getStatusIcon(reservation.statut)}
                            {reservation.statut === 'en_attente' ? 'En attente' :
                             reservation.statut === 'confirmée' ? 'Confirmée' :
                             reservation.statut === 'annulée' ? 'Annulée' : 'Terminée'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
