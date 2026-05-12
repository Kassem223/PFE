import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';

const SidebarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingNotif, setProcessingNotif] = useState(null);
  const [notifStatus, setNotifStatus] = useState(null); // { message, type }

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchNotifications(parsedUser.id);

        // If role is missing, try to repair from server
        if (!parsedUser.role && parsedUser.id) {
          try {
            const response = await axios.get(`http://localhost:3000/api/users/${parsedUser.id}`);
            if (response.data && response.data.role) {
              const updatedUser = { ...parsedUser, role: response.data.role };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
          } catch (e) {
            console.error('Failed to repair user role', e);
          }
        }
      }
    };

    loadUserData();

    // Listen for custom event when profile is updated
    window.addEventListener('userUpdated', loadUserData);
    
    // Also listen for storage event (for other tabs)
    window.addEventListener('storage', loadUserData);

    return () => {
      window.removeEventListener('userUpdated', loadUserData);
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userId}/notifications`);
      setNotifications(response.data);
      setUnreadNotifications(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleInvitationResponse = async (invitationId, response, notificationId = null) => {
    if (processingNotif) return;
    setProcessingNotif(notificationId || invitationId);
    setNotifStatus(null);
    
    try {
      // 1. Respond to invitation (if ID exists)
      if (invitationId && invitationId !== 'undefined') {
        try {
          await axios.put(`http://localhost:3000/api/invitations/${invitationId}/respond`, { response });
        } catch (invitErr) {
          console.error('Error updating invitation status:', invitErr);
          // Continue anyway to clear the notification if possible
        }
      }
      
      // 2. Mark notification as read (if ID exists)
      if (notificationId) {
        try {
          await axios.put(`http://localhost:3000/api/notifications/${notificationId}/read`);
        } catch (readErr) {
          console.error('Error marking notification as read:', readErr);
        }
      }
      
      // 3. Update local state immediately for instant feedback
      setNotifications(prev => prev.filter(n => 
        String(n.id_notification || n.id) !== String(notificationId)
      ));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
      
      // 4. Show success message
      setNotifStatus({
        message: response === 'accepted' ? 'Invitation acceptée !' : 'Invitation refusée',
        type: 'success'
      });
      
      // Hide status after 3 seconds
      setTimeout(() => setNotifStatus(null), 3000);

      // 5. Refresh full list in background after a short delay to ensure DB sync
      if (user) {
        setTimeout(() => fetchNotifications(user.id), 1000);
      }
    } catch (error) {
      console.error('Error in handleInvitationResponse:', error);
      setNotifStatus({ message: 'Erreur lors de la réponse', type: 'error' });
      setTimeout(() => setNotifStatus(null), 3000);
    } finally {
      setProcessingNotif(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reservation_invitation':
        return '📅';
      case 'reservation_accepted':
        return '✅';
      case 'reservation_refused':
        return '❌';
      case 'reservation_reminder':
        return '⏰';
      default:
        return '📬';
    }
  };

  const parseNotificationData = (notification) => {
    if (notification.data) {
      try {
        return typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const handleDisconnect = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to landing page
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-80 hidden lg:flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-r border-slate-200/40 dark:border-slate-800/40 sticky top-0 h-screen shadow-2xl">
      
      {/* Enhanced Branding Section - Sub-task 1 */}
      <Link to="/" className="group p-8 border-b border-slate-200/30 dark:border-slate-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-300 block hover:bg-slate-50 dark:hover:bg-slate-800/60">
        <div className="flex items-center gap-4">
          {/* Logo - Exact Landing Page Style */}
          <div className="relative w-14 h-14 rounded-lg bg-gradient-premium p-0.5 shadow-sm group-hover:shadow-md transition-all duration-300">
            <div className="w-full h-full rounded-[6px] bg-white dark:bg-neutral-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent group-hover:from-primary-500/20 transition-all duration-300" />
              <span className="text-2xl font-bold text-gradient relative z-10">V</span>
            </div>
          </div>

          {/* Branding text */}
          <div className="relative flex flex-col justify-center">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300">
              VEKTOR
            </h2>
            <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
              Management
            </p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="h-px mt-5 bg-gradient-to-r from-transparent via-slate-200/70 dark:via-slate-700/70 to-transparent"></div>
      </Link>

      {/* Enhanced Navigation - Sub-task 2 & 3 */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {/* Navigation items start here */}
        
        {/* Navigation Item - Catégorie */}
        <Link 
          to="/accueil" 
          className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
            location.pathname === '/accueil' 
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          {/* Left border indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Programmer reservation</span>
          {/* Indicator dot */}
          <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
        </Link>

        {/* Navigation Item - Reservations (User) */}
        {user?.role === 'user' && (
        <Link 
          to="/reservations" 
          className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
            location.pathname === '/reservations' 
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-sm font-medium">Reservations</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
        </Link>
        )}

        {/* Navigation Item - Manage Reservations (Manager) */}
        {user?.role === 'manager' && (
          <Link 
            to="/manage-reservations" 
            className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
              location.pathname === '/manage-reservations' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-medium">Gestion Des Réservations</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
          </Link>
        )}

        {/* Navigation Items - Admin */}
        {user?.role === 'admin' && (
          <>
            <Link 
              to="/users" 
              className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                location.pathname === '/users' 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium">Users</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
            </Link>
          </>
        )}

        {/* Navigation Item - Analyse (Admin/Manager) */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link 
            to="/analyse" 
            className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
              location.pathname === '/analyse' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Analyse</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
          </Link>
        )}

        {/* Notifications Button - For all authenticated users */}
        {user && (
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 w-full ${
              showNotifications
                ? 'bg-gradient-to-r from-blue-900 to-blue-800 dark:from-blue-100 dark:to-blue-50 text-white dark:text-blue-900 shadow-lg ring-2 ring-blue-900/20 dark:ring-blue-100/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="ml-auto w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>
        )}
      </nav>

      {/* Enhanced User Profile - Sub-task 4 */}
      <div className="p-6 border-t border-slate-200/30 dark:border-slate-800/30 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all duration-300">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-4 border border-slate-200/40 dark:border-slate-700/40 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-200 hover:shadow-md">
          {/* Settings Button */}
          <Link 
            to="/account"
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              location.pathname === '/account'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Paramètre Compte"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>

          {/* Avatar */}
          <div className="relative h-12 w-12 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 rounded-xl flex items-center justify-center shadow-inner ring-2 ring-white/50 dark:ring-slate-800/50 overflow-hidden">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white dark:text-slate-900 font-bold text-lg">
                {user ? getInitials(user.prenom + ' ' + user.nom) : 'U'}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user ? `${user.prenom} ${user.nom}` : 'Guest User'}
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {user ? user.role : 'Not authenticated'}
            </p>
          </div>

          {/* Online Status Indicator */}
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse shadow-lg"></div>
        </div>
        
        {/* Sign Out Button */}
        <button 
          onClick={handleDisconnect}
          className="group w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <span>Sign Out</span>
          <div className="w-4 h-4 rounded-full bg-red-400 dark:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
      </div>

      {/* Notifications Dropdown - Sub-task 5 */}
      {showNotifications && createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-20 left-80 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  🔔 Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {/* Status messages */}
                {notifStatus && (
                  <div className={`mx-4 mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${
                    notifStatus.type === 'success' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {notifStatus.type === 'success' ? '✅' : '❌'} {notifStatus.message}
                  </div>
                )}

                {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Aucune notification
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {notifications.filter(n => !n.is_read).map((notification) => {
                    const data = parseNotificationData(notification);
                    const isInvitation = notification.type === 'reservation_invitation';
                    return (
                      <div
                        key={notification.id_notification}
                        className={`p-4 transition-all duration-200 ${
                          !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Unread indicator */}
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all duration-200 ${
                            !notification.is_read ? 'bg-blue-500 shadow-lg' : 'bg-slate-300 dark:bg-slate-600'
                          }`}></div>
                          
                          {/* Notification content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>

                            {/* Action buttons for invitations */}
                            {isInvitation && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  disabled={processingNotif === notification.id_notification}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvitationResponse(data.invitation_id, 'accepted', notification.id_notification);
                                  }}
                                  className={`flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1 ${
                                    processingNotif === notification.id_notification ? 'opacity-70 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {processingNotif === notification.id_notification ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : '✅ Accepter'}
                                </button>
                                <button
                                  disabled={processingNotif === notification.id_notification}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvitationResponse(data.invitation_id, 'refused', notification.id_notification);
                                  }}
                                  className={`flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1 ${
                                    processingNotif === notification.id_notification ? 'opacity-70 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {processingNotif === notification.id_notification ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : '❌ Refuser'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <button
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  onClick={() => {
                    setShowNotifications(false);
                  }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      , document.body)}
    </aside>
  );
};

export default SidebarComponent;