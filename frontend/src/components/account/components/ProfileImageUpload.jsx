import React, { useRef } from 'react';

export const ProfileImageUpload = ({ profileImagePreview, user, onImageChange, onTriggerFileInput }) => {
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    onTriggerFileInput();
  };

  return (
    <div className="relative group">
      {/* Profile Image */}
      <div 
        className="w-24 h-24 rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
        onClick={triggerFileInput}
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
      <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerFileInput}>
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
  );
};
