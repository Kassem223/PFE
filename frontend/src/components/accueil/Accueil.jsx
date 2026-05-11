import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Static categories
const STATIC_CATEGORIES = [
  {
    key: 'vehicules',
    name: 'Véhicules',
    description: 'Flotte d\'entreprise',
    icon: '🚗',
    color: 'from-cyan-500 to-blue-600',
    dbName: "Flotte d'entreprise",
    image: '/src/assets/flotte.png'
  },
  {
    key: 'salles',
    name: 'Salles',
    description: 'Salles de réunion et espaces',
    icon: '🏢',
    color: 'from-blue-500 to-blue-600',
    dbName: 'Salles',
    image: '/src/assets/salle A.png'
  },
  {
    key: 'equipement',
    name: 'Équipements',
    description: 'Équipements et matériel',
    icon: '🖥️',
    color: 'from-cyan-400 to-blue-500',
    dbName: 'Équipement',
    image: '/src/assets/projecteur.jpg'
  }
];

export const Accueil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCategoryClick = (categoryKey) => {
    if (categoryKey === 'vehicules') {
      navigate('/category/vehicules'); // Rediriger vers la page d'ajout de véhicule
    } else {
      navigate(`/category/${categoryKey}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b border-cyan-200 dark:border-neutral-800 sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Management Hub</p>
      </header>

      {/* Main Content */}
      <main className="p-10 max-w-7xl mx-auto w-full">
        {/* Title Section */}
        <div className="mb-16">
          <h1 className="text-6xl font-black text-neutral-900 dark:text-white mb-2">Inventaire</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Sélectionnez une catégorie pour voir les ressources disponibles</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATIC_CATEGORIES.map((category) => (
            <div
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              {/* Background with Image */}
              <div className={`absolute inset-0 ${category.color} opacity-95 group-hover:opacity-100 transition-opacity duration-300`}>
                {category.image && (
                  <img 
                    src={category.image} 
                    className="w-full h-full object-cover" 
                    alt={category.name}
                  />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">{category.name}</h3>
                <p className="text-white/90 text-sm font-medium drop-shadow">{category.description}</p>

                {/* Arrow */}
                <div className="mt-4 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                  <span className="text-sm font-semibold">Voir les ressources</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 bg-cyan-100/50 dark:bg-cyan-900/20 border border-cyan-300 dark:border-cyan-800 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-300 mb-2">Comment utiliser</h3>
              <ul className="text-cyan-800 dark:text-cyan-200 space-y-1 text-sm">
                <li>✓ Cliquez sur une catégorie pour voir les ressources disponibles</li>
                <li>✓ Les utilisateurs peuvent réserver des ressources</li>
                <li>✓ Les administrateurs peuvent ajouter, modifier ou supprimer des ressources</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accueil;
