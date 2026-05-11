import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { uploadImageToBackend } from '../../utils/cloudinary';
import { ProfileOverview } from './components/ProfileOverview';
import { PersonalInfoForm } from './components/PersonalInfoForm';

export const AccountManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    jobtitle: '',
    departement: '',
    profile_image: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        adresse: userData.adresse || '',
        jobtitle: userData.jobtitle || '',
        departement: userData.departement || '',
        profile_image: userData.profile_picture || ''
      });
      setProfileImagePreview(userData.profile_picture || null);
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfileFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let profileImageUrl = formData.profile_image;
      
      // Upload profile image to Cloudinary if a new file is selected
      if (selectedProfileFile) {
        profileImageUrl = await uploadImageToBackend(selectedProfileFile);
      }
      
      const updatedFormData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        departement: formData.departement,
        adresse: formData.adresse,
        jobtitle: formData.jobtitle,
        profile_picture: profileImageUrl
      };
      
      const response = await axios.put(`http://localhost:3000/api/users/${user.id}`, updatedFormData);
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...updatedFormData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('Profil mis à jour avec succès !');
      setSelectedProfileFile(null); // Reset selected file
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      adresse: user.adresse || '',
      jobtitle: user.jobtitle || '',
      departement: user.departement || '',
      profile_image: user.profile_picture || ''
    });
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Utilisateur non trouvé
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Veuillez vous reconnecter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Paramètres du compte
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Profile Overview */}
        <ProfileOverview 
          user={user}
          profileImagePreview={profileImagePreview}
          onTriggerFileInput={triggerFileInput}
          onImageChange={handleProfileImageChange}
          fileInputRef={fileInputRef}
        />

        {/* Personal Info Form */}
        <PersonalInfoForm 
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          saving={saving}
          message={message}
        />
      </div>
    </div>
  );
};
