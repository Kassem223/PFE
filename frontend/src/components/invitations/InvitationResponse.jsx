import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const InvitationResponse = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResponse = useCallback(async (customStatus = null, customReason = '') => {
    console.log('handleResponse called with:', { token, status, customStatus, customReason });
    
    setSubmitting(true);
    setError('');
    setLoading(false);

    try {
      const responseStatus = customStatus || status;
      const responseReason = customReason || refusalReason;

      console.log('Making API call to:', `http://localhost:3000/api/invitations/${token}/respond`);
      console.log('Request data:', { status: responseStatus, refusal_reason: responseReason });

      const response = await axios.post(`http://localhost:3000/api/invitations/${token}/respond`, {
        status: responseStatus,
        refusal_reason: responseStatus === 'refused' ? responseReason : null
      });

      console.log('API response:', response.data);
      setSuccess(true);
      setInvitationData(response.data);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Erreur lors du traitement de l\'invitation');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }, [token, status, refusalReason, searchParams]);

  useEffect(() => {
    if (token && status) {
      // Auto-submit the response if status is provided in URL
      handleResponse();
    } else {
      // If no status provided, just stop loading
      setLoading(false);
    }
  }, [token, status, handleResponse, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-md w-full">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Réponse enregistrée
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Votre réponse a été envoyée avec succès à l'organisateur.
            </p>
            {invitationData?.reservation && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Détails de la réservation:</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Date: {new Date(invitationData.reservation.date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Horaires: {invitationData.reservation.time_start} - {invitationData.reservation.time_end}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Équipement: {invitationData.reservation.equipment}
                </p>
              </div>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Répondre à l'invitation
            </h2>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!status && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Veuillez choisir si vous acceptez ou refusez cette invitation:
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleResponse('accepted')}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Envoi...' : 'Accepter'}
                  </button>
                </div>

                {refusalReason !== null && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                      Raison du refus (optionnel):
                    </label>
                    <textarea
                      value={refusalReason}
                      onChange={(e) => setRefusalReason(e.target.value)}
                      placeholder="Veuillez indiquer la raison de votre refus..."
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg text-sm resize-none"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleResponse('refused', refusalReason)}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Envoi...' : 'Confirmer le refus'}
                      </button>
                      <button
                        onClick={() => setRefusalReason(null)}
                        disabled={submitting}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
