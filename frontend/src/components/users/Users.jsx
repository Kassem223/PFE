import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'manager'
  });
  const [editForm, setEditForm] = useState({
    email: '',
    role: 'user'
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'manager':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'user':
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'manager':
        return '📊';
      case 'user':
      default:
        return '👤';
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleInviteManager = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/invite-manager', {
        email: inviteForm.email,
        role: 'manager'
      });
      
      setInviteMessage('Invitation envoyée avec succès !');
      setInviteForm({ email: '', role: 'manager' });
      setShowInviteForm(false);
    } catch (error) {
      setInviteMessage(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOpenEditForm = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      role: user.role
    });
    setEditMessage('');
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage('');
    
    try {
      await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, {
        nom: editingUser.nom,
        prenom: editingUser.prenom,
        email: editForm.email,
        role: editForm.role,
        departement: editingUser.departement
      });
      
      setEditMessage('Utilisateur mis à jour avec succès !');
      setTimeout(() => {
        setShowEditForm(false);
        fetchUsers();
      }, 1000);
    } catch (error) {
      setEditMessage(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`)) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.prenom} ${user.nom} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    user: users.filter(u => u.role === 'user').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="p-10 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Utilisateurs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gérez tous les utilisateurs du système
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{roleStats.all}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{roleStats.admin}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{roleStats.manager}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Managers</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">{roleStats.user}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    roleFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    roleFilter === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setRoleFilter('manager')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    roleFilter === 'manager'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Managers
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    roleFilter === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Users
                </button>
              </div>
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                + Inviter Manager
              </button>
            </div>
          </div>

          {/* Invitation Form Modal */}
          {showInviteForm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Inviter un Manager
                    </h2>
                    <button 
                      onClick={() => setShowInviteForm(false)}
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-2xl hover:scale-110 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleInviteManager} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Email du manager
                      </label>
                      <input
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        placeholder="manager@entreprise.com"
                        required
                      />
                    </div>
                    
                    {inviteMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        inviteMessage.includes('succès') 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {inviteMessage}
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={inviteLoading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {inviteLoading ? 'Envoi en cours...' : 'Inviter'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditForm && editingUser && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Modifier l'utilisateur
                    </h2>
                    <button 
                      onClick={() => setShowEditForm(false)}
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-2xl hover:scale-110 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={editingUser.nom}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white opacity-60 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={editingUser.prenom}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white opacity-60 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Rôle
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    
                    {editMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        editMessage.includes('succès') 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {editMessage}
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditForm(false)}
                        className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {editLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Mise à jour...
                          </>
                        ) : 'Sauvegarder'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-6xl mb-4 opacity-20">👥</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm || roleFilter !== 'all' ? 'Essayez de modifier vos filtres' : 'Aucun utilisateur dans la base de données'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* User Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white dark:text-slate-900 font-bold text-xl">
                        {getInitials(user.prenom, user.nom)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {user.prenom} {user.nom}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">{getRoleIcon(user.role)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(user.role)}`}>
                      {user.role || 'User'}
                    </span>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3 mb-6">
                    {user.jobtitle && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">💼</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{user.jobtitle}</span>
                      </div>
                    )}
                    {user.departement && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">🏢</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{user.departement}</span>
                      </div>
                    )}
                    {user.adresse && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">📍</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{user.adresse}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <button 
                      onClick={() => handleOpenEditForm(user)}
                      className="flex-1 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)}
                      className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Supprimer
                    </button>
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
