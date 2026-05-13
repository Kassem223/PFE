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
    const fetchLatestUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
          const response = await axios.get(`http://localhost:3000/api/users/${storedUser.id}`);
          if (response.data) {
            // Ensure role and email are preserved/updated from server
            const latestUser = { ...storedUser, ...response.data };
            localStorage.setItem('user', JSON.stringify(latestUser));
            setUser(latestUser);
            setFormData({
              nom: latestUser.nom || '',
              prenom: latestUser.prenom || '',
              adresse: latestUser.adresse || '',
              jobtitle: latestUser.jobtitle || '',
              departement: latestUser.departement || '',
              profile_image: latestUser.profile_picture || ''
            });
            setProfileImagePreview(latestUser.profile_picture || null);
          }
        }
      } catch (error) {
        console.error('Error fetching latest user data:', error);
        // Fallback to local data if server fetch fails
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUserData();
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
      // Show preview immediately
      const imageUrl = URL.createObjectURL(file);
      setProfileImagePreview(imageUrl);
      setSelectedProfileFile(file);
      
      try {
        // Upload to Cloudinary immediately
        const uploadedImageUrl = await uploadImageToBackend(file);
        
        // Update form data with uploaded URL
        setFormData(prev => ({
          ...prev,
          profile_image: uploadedImageUrl
        }));
        
        // Update localStorage and dispatch event immediately for live preview in sidebar
        const updatedUser = { ...user, profile_picture: uploadedImageUrl, profile_image: uploadedImageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('userUpdated'));
        
        // Update preview with final URL
        setProfileImagePreview(uploadedImageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessage('Erreur lors de l\'upload de l\'image');
      }
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
      
      // Upload profile image to Cloudinary only if file was selected but not yet uploaded
      // (It's already uploaded in handleProfileImageChange, so this is just a safety check)
      if (selectedProfileFile && !profileImageUrl.startsWith('http')) {
        profileImageUrl = await uploadImageToBackend(selectedProfileFile);
      }
      
      const updatedFormData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: user.email,
        role: user.role,
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
      
      // Dispatch custom event to notify other components (like Sidebar)
      window.dispatchEvent(new Event('userUpdated'));
      
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
