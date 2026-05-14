import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, UserPlus, Mail, Settings, X, Package, MapPin, Navigation, FileText, Zap, MessageSquare, Briefcase } from 'lucide-react';

export const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelDescription, setCancelDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  const [expandedReservation, setExpandedReservation] = useState(null);
  const [invitations, setInvitations] = useState({});
  const [equipmentsData, setEquipmentsData] = useState({});

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/reservations');
      setReservations(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Erreur lors du chargement des réservations');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus, description = '') => {
    setUpdating(true);
    try {
      await axios.put(`http://localhost:3000/api/reservations/${reservationId}/status`, {
        statut: newStatus,
        description: description
      });
      setReservations(prev => prev.map(res =>
        res.id_reservation === reservationId
          ? { ...res, statut: newStatus, description: description }
          : res
      ));
      setUpdating(false);
      if (showCancelModal) {
        setShowCancelModal(false);
        setSelectedReservation(null);
        setCancelDescription('');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      setUpdating(false);
    }
  };

  const openCancelModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
    setCancelDescription('');
  };

  const confirmCancel = () => {
    if (selectedReservation && cancelDescription.trim()) {
      handleStatusChange(selectedReservation.id_reservation, 'annulée', cancelDescription);
    }
  };

  const fetchInvitations = async (reservationId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/${reservationId}/invitations`);
      setInvitations(prev => ({ ...prev, [reservationId]: response.data }));
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  };

  const loadEquipments = async (reservationId) => {
    if (equipmentsData[reservationId]) return;
    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/${reservationId}/equipments`);
      setEquipmentsData(prev => ({ ...prev, [reservationId]: response.data }));
    } catch (err) {
      console.error('Error loading equipments:', err);
    }
  };

  const toggleReservationDetails = (reservation) => {
    const id = reservation.id_reservation;
    if (expandedReservation === id) {
      setExpandedReservation(null);
    } else {
      setExpandedReservation(id);
      if (!invitations[id]) fetchInvitations(id);
      loadEquipments(id);
    }
  };

  const getInvitationStatusIcon = (status) => {
    switch (status) {
      case 'acceptée':
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'refusée':
      case 'refused': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (timeString) => timeString?.substring(0, 5) ?? '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Gérer les Réservations
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Consultez et gérez toutes les réservations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Aucune réservation trouvée
            </h3>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div
                key={reservation.id_reservation}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-end gap-3 mb-4">
                    {reservation.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation.id_reservation, 'confirmée')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accepter
                        </button>
                        <button
                          onClick={() => openCancelModal(reservation)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Refuser
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleReservationDetails(reservation)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {expandedReservation === reservation.id_reservation ? 'Masquer' : 'Détails'}
                    </button>
                  </div>

                  {/* Resource Info */}
                  <div className="mb-4 flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {reservation.resource_image ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        <img
                          src={reservation.resource_image}
                          alt={reservation.resource_nom || reservation.equipement_nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {reservation.resource_nom || reservation.equipement_nom || 'Ressource'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {reservation.category_type === 'salles' ? 'Salle' : reservation.category_type === 'vehicules' ? 'Véhicule' : 'Équipement'}
                      </p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap items-center gap-6">
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Horaire</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatTime(reservation.time_start)} – {formatTime(reservation.time_end)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Demandeur</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {reservation.prenom} {reservation.nom}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedReservation === reservation.id_reservation && (
                  <div className="p-6 space-y-5">

                    {/* Equipments — salles only */}
                    {reservation.category_type === 'salles' && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          {(() => {
                            const list = equipmentsData[reservation.id_reservation] || [];
                            const total = list.reduce((s, e) => s + (Number(e.quantity) > 0 ? Number(e.quantity) : 1), 0);
                            return `Équipements réservés (${total} unité${total > 1 ? 's' : ''})`;
                          })()}
                        </h4>
                        {equipmentsData[reservation.id_reservation]?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pl-9">
                            {equipmentsData[reservation.id_reservation].map((eq, i) => {
                              const q = Number(eq.quantity) > 0 ? Number(eq.quantity) : 1;
                              return (
                                <span key={i} className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-200">
                                  {eq.nom}{q > 1 ? ` × ${q}` : ''}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-9">Aucun équipement supplémentaire</p>
                        )}
                      </div>
                    )}

                    {/* Note — salles only */}
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

                    {/* Invitations — salles only */}
                    {reservation.category_type === 'salles' && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                            <Mail className="w-4 h-4 text-white" />
                          </div>
                          Invitations ({invitations[reservation.id_reservation]?.length || 0})
                        </h4>
                        {invitations[reservation.id_reservation]?.length > 0 ? (
                          <div className="space-y-2 ml-9">
                            {invitations[reservation.id_reservation].map((inv, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {inv.email || `${inv.prenom} ${inv.nom}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {getInvitationStatusIcon(inv.statut)}
                                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    {getInvitationStatusText(inv.statut)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-9">Aucune invitation</p>
                        )}
                      </div>
                    )}

                    {/* Vehicle details */}
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
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Départ</p>
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_depart}</p>
                            </div>
                          )}
                          {reservation.vehicle_destination && (
                            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><Navigation className="w-3 h-3" />Destination</p>
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_destination}</p>
                            </div>
                          )}
                          {reservation.vehicle_distance && (
                            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><Zap className="w-3 h-3" />Distance</p>
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{reservation.vehicle_distance} km</p>
                            </div>
                          )}
                          {reservation.vehicle_note && (
                            <div className="col-span-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Note</p>
                              <p className="text-sm text-slate-800 dark:text-slate-200">{reservation.vehicle_note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer info */}
                    {reservation.created_at && (
                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                        Créée le {new Date(reservation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(reservation.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Refuser la réservation
                </h3>
              </div>

              <div className="mb-6 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">DÉTAILS DE LA RÉSERVATION</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {selectedReservation?.prenom} {selectedReservation?.nom}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(selectedReservation?.date_reservation).toLocaleDateString('fr-FR')} · {selectedReservation?.time_start?.substring(0, 5)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Raison du refus *
                </label>
                <textarea
                  value={cancelDescription}
                  onChange={(e) => setCancelDescription(e.target.value)}
                  placeholder="Expliquez pourquoi cette réservation est refusée..."
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none placeholder-slate-500 dark:placeholder-slate-400"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowCancelModal(false); setSelectedReservation(null); setCancelDescription(''); }}
                  className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={!cancelDescription.trim() || updating}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold shadow-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {updating ? 'Refus en cours...' : 'Confirmer le refus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
