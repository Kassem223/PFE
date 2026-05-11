import React from 'react';

export const ProfileOverview = ({ user, profileImagePreview, onTriggerFileInput, onImageChange, fileInputRef }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 mb-6">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          {/* Profile Image */}
          <div 
            className="w-24 h-24 rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
            onClick={onTriggerFileInput}
          >
            {profileImagePreview ? (
              <img 
                src={profileImagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.prenom?.[0] || ''}{user.nom?.[0] || ''}
              </div>
            )}
          </div>
          
          {/* Edit Overlay */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onTriggerFileInput}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={onImageChange} 
            accept="image/*" 
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user.prenom} {user.nom}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.role === 'admin' 
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                : user.role === 'manager'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            }`}>
              {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Manager' : 'User'}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Cliquez sur la photo pour la modifier
          </p>
        </div>
      </div>

      {/* Read-only Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
            Email
          </label>
          <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Non modifiable</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
            Rôle
          </label>
          <p className="text-slate-900 dark:text-white font-medium">
            {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Manager' : 'User'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Non modifiable</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
            Date de création
          </label>
          <p className="text-slate-900 dark:text-white font-medium">
            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Non modifiable</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
            Dernière mise à jour
          </label>
          <p className="text-slate-900 dark:text-white font-medium">
            {user.updated_at ? new Date(user.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Non modifiable</p>
        </div>
      </div>
    </div>
  );
};
