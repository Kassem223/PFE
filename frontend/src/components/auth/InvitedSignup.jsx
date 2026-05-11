import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const InvitedSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mdp: '',
    confirmMdp: '',
    adresse: '',
    jobtitle: '',
    departement: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setMessage('Token d\'invitation manquant');
      setLoading(false);
      return;
    }

    verifyInvitation(token);
  }, [token]);

  const verifyInvitation = async (token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/verify-invitation/${token}`);
      setInvitation(response.data);
      setFormData(prev => ({ ...prev, email: response.data.email }));
      setLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Invitation invalide');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.mdp !== formData.confirmMdp) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.mdp.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/api/register-from-invitation', {
        token,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mdp: formData.mdp,
        adresse: formData.adresse,
        jobtitle: formData.jobtitle,
        departement: formData.departement
      });

      setMessage('ajout avec succes');
       
      // Store user data and redirect
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  if (message && !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 max-w-md">
          <div className="text-6xl mb-4 opacity-20">🔐</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Invitation invalide
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {message}
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Créer votre compte
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Vous avez été invité par {invitation?.inviter}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {invitation?.role === 'admin' ? 'admin' : 'Manager'}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {invitation?.email}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  placeholder="Jean"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Password Fields */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.mdp}
                onChange={(e) => setFormData({...formData, mdp: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmMdp}
                onChange={(e) => setFormData({...formData, confirmMdp: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Optional Fields */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Adresse (optionnel)
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="123 rue de la République"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Poste (optionnel)
                </label>
                <select
                  value={formData.jobtitle}
                  onChange={(e) => setFormData({...formData, jobtitle: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Développeur">Développeur</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Chef de projet">Chef de projet</option>
                  <option value="Analyste">Analyste</option>
                  <option value="Technicien">Technicien</option>
                  <option value="RH">RH</option>
                  <option value="Comptable">Comptable</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Département (optionnel)
                </label>
                <select
                  value={formData.departement}
                  onChange={(e) => setFormData({...formData, departement: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="IT">IT</option>
                  <option value="RH">RH</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Production">Production</option>
                  <option value="Logistique">Logistique</option>
                  <option value="Direction">Direction</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('succes')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Vous avez déjà un compte ?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
