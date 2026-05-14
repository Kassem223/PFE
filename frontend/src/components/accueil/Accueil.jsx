import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STATIC_CATEGORIES = [
  {
    key: 'vehicules',
    name: 'Véhicules',
    description: 'Réservez un véhicule de la flotte d\'entreprise',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zM13 16l2-5h4l2 5H13z" />
      </svg>
    ),
    color: '#3B82F6',
    image: '/src/assets/flotte.png',
    stat: 'Flotte disponible',
  },
  {
    key: 'salles',
    name: 'Salles',
    description: 'Réservez une salle de réunion ou un espace de travail',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: '#FF6D29',
    image: '/src/assets/salle A.png',
    stat: 'Espaces disponibles',
  },
];

export const Accueil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [reservationNotice, setReservationNotice] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const msg = location.state?.reservationMessage;
    if (location.state?.reservationSuccess && msg) {
      setReservationNotice(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleCategoryClick = (key) => navigate(`/category/${key}`);

  return (
    <div className="min-h-screen bg-[#161316] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Success notice */}
        {reservationNotice && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-emerald-400 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium">{reservationNotice}</p>
            </div>
            <button onClick={() => setReservationNotice(null)} className="text-emerald-500/60 hover:text-emerald-400 transition-colors text-lg leading-none">×</button>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Tableau de bord</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Bonjour{user ? `, ${user.prenom}` : ''} 👋
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            Sélectionnez une catégorie pour effectuer votre réservation
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {STATIC_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryClick(cat.key)}
              className="group relative h-56 rounded-2xl overflow-hidden border border-[#2A2730] hover:border-[#3A3740] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-left"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161316] via-[#161316]/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}30` }}
                >
                  {cat.icon}
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-sm text-[#A1A1AA] mb-4">{cat.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: cat.color }}>
                    <span>Voir les ressources</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="rounded-xl border border-[#2A2730] bg-[#1E1B1F] p-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Comment utiliser</h4>
              <ul className="space-y-1.5 text-sm text-[#A1A1AA]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                  Cliquez sur <strong className="text-white">Salles</strong> ou <strong className="text-white">Véhicules</strong> pour consulter le catalogue et réserver un créneau
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                  Pour commander du matériel, utilisez <strong className="text-white">Commander équipement</strong> dans le menu
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                  Les administrateurs peuvent gérer les ressources depuis les pages catégories
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Accueil;
