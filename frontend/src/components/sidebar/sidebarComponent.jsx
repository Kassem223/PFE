import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadEquipmentOrders } from '../../utils/equipmentOrdersStorage';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
  </svg>
);

const ICONS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  cart:      'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  orders:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9v2m0 0v2m0-2h2m-2 0H9',
  settings:  'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  users:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  chart:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  bell:      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  gear:      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
};

// ── NavItem ────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon, label, badge, isActive }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-accent/10 text-white border border-accent/20'
        : 'text-[#A1A1AA] hover:text-white hover:bg-[#252229]'
    }`}
  >
    {/* Active indicator */}
    {isActive && (
      <span className="absolute left-0 w-0.5 h-5 bg-accent rounded-r-full" />
    )}
    <Icon d={ICONS[icon]} className="w-4 h-4 shrink-0" />
    <span className="flex-1 truncate">{label}</span>
    {badge > 0 && (
      <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-accent text-white">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

// ── Section Label ──────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-widest">
    {children}
  </p>
);

// ── Main Component ─────────────────────────────────────────────────────────
const SidebarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (!parsedUser.role && parsedUser.id) {
          try {
            const res = await axios.get(`http://localhost:3000/api/users/${parsedUser.id}`);
            if (res.data?.role) {
              const updated = { ...parsedUser, role: res.data.role };
              localStorage.setItem('user', JSON.stringify(updated));
              setUser(updated);
            }
          } catch (e) { /* silent */ }
        }
      }
    };
    loadUserData();
    window.addEventListener('userUpdated', loadUserData);
    window.addEventListener('storage', loadUserData);
    return () => {
      window.removeEventListener('userUpdated', loadUserData);
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) { setUnreadNotifications(0); return; }
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${user.id}/notifications`);
        if (!cancelled) setUnreadNotifications(Array.isArray(res.data) ? res.data.length : 0);
      } catch { if (!cancelled) setUnreadNotifications(0); }
    };
    fetch();
    const id = setInterval(fetch, 60000);
    const refresh = () => fetch();
    window.addEventListener('focus', refresh);
    window.addEventListener('notificationsUpdated', refresh);
    return () => { cancelled = true; clearInterval(id); window.removeEventListener('focus', refresh); window.removeEventListener('notificationsUpdated', refresh); };
  }, [user?.id, location.pathname]);

  useEffect(() => {
    if (!user?.id) { setOrdersCount(0); return; }
    const update = () => setOrdersCount(loadEquipmentOrders(user.id).length);
    update();
    window.addEventListener('equipmentOrdersUpdated', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('equipmentOrdersUpdated', update); window.removeEventListener('storage', update); };
  }, [user?.id]);

  const handleDisconnect = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleLabel = { admin: 'Administrateur', manager: 'Manager', user: 'Utilisateur' };

  return (
    <aside className="w-64 hidden lg:flex flex-col bg-[#1A1720] border-r border-[#2A2730] sticky top-0 h-screen">

      {/* ── Logo ── */}
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2730] hover:bg-[#1E1B1F] transition-colors">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-accent shrink-0">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">VEKTOR</p>
          <p className="text-[10px] text-[#71717A] font-medium">Management</p>
        </div>
      </Link>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        <SectionLabel>Réservations</SectionLabel>
        <NavItem to="/accueil"             icon="calendar"  label="Programmer"          isActive={isActive('/accueil')} />
        <NavItem to="/commander-equipement" icon="cart"     label="Commander équipement" isActive={isActive('/commander-equipement')} />

        {user?.role === 'user' && (
          <NavItem to="/reservations" icon="clipboard" label="Mes réservations" isActive={isActive('/reservations')} />
        )}

        {user && (
          <NavItem to="/mes-commandes" icon="orders" label="Mes commandes" isActive={isActive('/mes-commandes')} badge={ordersCount} />
        )}

        {user?.role === 'manager' && (
          <>
            <SectionLabel>Gestion</SectionLabel>
            <NavItem to="/manage-reservations" icon="settings" label="Gérer réservations" isActive={isActive('/manage-reservations')} />
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <NavItem to="/users"  icon="users"   label="Utilisateurs"  isActive={isActive('/users')} />
          </>
        )}

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <NavItem to="/analyse" icon="chart" label="Analyse" isActive={isActive('/analyse')} />
        )}

        {user && (
          <>
            <SectionLabel>Compte</SectionLabel>
            <NavItem to="/notification" icon="bell" label="Notifications" isActive={isActive('/notification')} badge={unreadNotifications} />
            <NavItem to="/account"      icon="gear" label="Mon profil"    isActive={isActive('/account')} />
          </>
        )}
      </nav>

      {/* ── User Profile ── */}
      {user && (
        <div className="p-3 border-t border-[#2A2730]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1E1B1F] border border-[#2A2730] mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shrink-0 overflow-hidden">
              {user.profile_picture
                ? <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-xs">{getInitials(`${user.prenom} ${user.nom}`)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.prenom} {user.nom}</p>
              <p className="text-[10px] text-[#71717A] capitalize">{roleLabel[user.role] || user.role}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#71717A] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <Icon d={ICONS.logout} className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SidebarComponent;
