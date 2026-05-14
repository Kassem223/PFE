import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':   return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'manager': return 'bg-blue-500/10   text-blue-400   border border-blue-500/20';
    default:        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }
};

const getRoleLabel = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':   return 'Admin';
    case 'manager': return 'Manager';
    default:        return 'Utilisateur';
  }
};

const getInitials = (first, last) =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'U';

const StatCard = ({ label, value, color }) => (
  <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 hover:border-[#3A3740] transition-all duration-200">
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-[#71717A] font-medium uppercase tracking-wider">{label}</p>
    <div className={`mt-3 h-0.5 w-8 rounded-full ${color}`} />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
    <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2730]">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#252229] transition-all">×</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">{label}</label>
    {children}
  </div>
);

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'manager' });
  const [editForm, setEditForm] = useState({ email: '', role: 'user' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInviteManager = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage('');
    try {
      await axios.post('http://localhost:3000/api/invite-manager', { email: inviteForm.email, role: 'manager' });
      setInviteMessage('success');
      setInviteForm({ email: '', role: 'manager' });
      setTimeout(() => setShowInviteForm(false), 1200);
    } catch (err) {
      setInviteMessage(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally { setInviteLoading(false); }
  };

  const handleOpenEditForm = (user) => {
    setEditingUser(user);
    setEditForm({ email: user.email, role: user.role });
    setEditMessage('');
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage('');
    try {
      await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, {
        nom: editingUser.nom, prenom: editingUser.prenom,
        email: editForm.email, role: editForm.role, departement: editingUser.departement,
      });
      setEditMessage('success');
      setTimeout(() => { setShowEditForm(false); fetchUsers(); }, 1000);
    } catch (err) {
      setEditMessage(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally { setEditLoading(false); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Supprimer ${userName} ? Cette action est irréversible.`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) { alert(err.response?.data?.error || 'Erreur lors de la suppression'); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    all:     users.length,
    admin:   users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    user:    users.filter(u => u.role === 'user').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#161316] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A2730] border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#161316] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Administration</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Utilisateurs</h1>
            <p className="text-sm text-[#A1A1AA] mt-0.5">Gérez les comptes et les rôles</p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-accent active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Inviter un manager
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total"    value={stats.all}     color="bg-[#A1A1AA]" />
          <StatCard label="Admins"   value={stats.admin}   color="bg-purple-500" />
          <StatCard label="Managers" value={stats.manager} color="bg-blue-500" />
          <StatCard label="Users"    value={stats.user}    color="bg-emerald-500" />
        </div>

        {/* Filters */}
        <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white placeholder-[#52525B] focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all',     label: 'Tous',     active: 'bg-white/10 text-white border-white/20' },
              { key: 'admin',   label: 'Admins',   active: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              { key: 'manager', label: 'Managers', active: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { key: 'user',    label: 'Users',    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setRoleFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  roleFilter === f.key ? f.active : 'text-[#71717A] border-[#2A2730] hover:text-white hover:bg-[#252229]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-[#1E1B1F] border border-[#2A2730] rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-[#252229] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#52525B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white mb-1">Aucun utilisateur trouvé</p>
            <p className="text-xs text-[#71717A]">{searchTerm || roleFilter !== 'all' ? 'Modifiez vos filtres' : 'Aucun utilisateur dans la base'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 hover:border-[#3A3740] hover:-translate-y-0.5 transition-all duration-200 group">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{getInitials(user.prenom, user.nom)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-[#71717A] truncate">{user.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadge(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {/* Details */}
                {(user.jobtitle || user.departement) && (
                  <div className="space-y-1.5 mb-4 pb-4 border-b border-[#2A2730]">
                    {user.jobtitle && (
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <svg className="w-3.5 h-3.5 text-[#52525B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.jobtitle}
                      </div>
                    )}
                    {user.departement && (
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <svg className="w-3.5 h-3.5 text-[#52525B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {user.departement}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditForm(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] border border-[#2A2730] hover:text-white hover:bg-[#252229] hover:border-[#3A3740] transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400/70 border border-red-500/10 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteForm && (
        <Modal title="Inviter un manager" onClose={() => setShowInviteForm(false)}>
          <form onSubmit={handleInviteManager} className="space-y-4">
            <Field label="Email du manager">
              <input
                type="email"
                value={inviteForm.email}
                onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="manager@entreprise.com"
                required
                className="w-full px-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white placeholder-[#52525B] focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </Field>
            {inviteMessage && (
              <div className={`p-3 rounded-lg text-xs font-medium ${inviteMessage === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {inviteMessage === 'success' ? '✓ Invitation envoyée avec succès !' : inviteMessage}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowInviteForm(false)} className="flex-1 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white border border-[#2A2730] rounded-lg hover:bg-[#252229] transition-all">Annuler</button>
              <button type="submit" disabled={inviteLoading} className="flex-1 px-4 py-2.5 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all disabled:opacity-40">
                {inviteLoading ? 'Envoi...' : 'Inviter'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditForm && editingUser && (
        <Modal title="Modifier l'utilisateur" onClose={() => setShowEditForm(false)}>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom">
                <input value={editingUser.nom} disabled className="w-full px-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-[#52525B] cursor-not-allowed" />
              </Field>
              <Field label="Prénom">
                <input value={editingUser.prenom} disabled className="w-full px-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-[#52525B] cursor-not-allowed" />
              </Field>
            </div>
            <Field label="Email">
              <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required
                className="w-full px-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
            </Field>
            <Field label="Rôle">
              <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none">
                <option value="user">Utilisateur</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
              </select>
            </Field>
            {editMessage && (
              <div className={`p-3 rounded-lg text-xs font-medium ${editMessage === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {editMessage === 'success' ? '✓ Utilisateur mis à jour !' : editMessage}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditForm(false)} className="flex-1 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white border border-[#2A2730] rounded-lg hover:bg-[#252229] transition-all">Annuler</button>
              <button type="submit" disabled={editLoading} className="flex-1 px-4 py-2.5 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {editLoading ? (<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mise à jour...</>) : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
