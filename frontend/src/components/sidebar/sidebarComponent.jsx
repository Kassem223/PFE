import React, { useState, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';



const SidebarComponent = () => {

  const location = useLocation();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [unreadNotifications, setUnreadNotifications] = useState(0);



  useEffect(() => {

    const loadUserData = async () => {

      const userData = localStorage.getItem('user');

      if (userData) {

        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);



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

        <Link

          to="/notification"

          className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${

            location.pathname === '/notification'

              ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20'

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

        </Link>

        )}



        {/* Profile Edit Button */}

        {user && (

        <Link

          to="/account"

          className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${location.pathname === '/account' ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg ring-2 ring-primary-500/20 dark:ring-primary-400/20' : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md hover:-translate-y-0.5'}`}

        >

          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>

          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />

            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

          </svg>

          <span className="text-sm font-medium">Modifier Profil</span>

          <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200"></div>

        </Link>

        )}

      </nav>



      {/* Enhanced User Profile - Sub-task 4 */}

      <div className="p-6 border-t border-slate-200/30 dark:border-slate-800/30 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all duration-300">

        {/* Profile Card */}

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-4 border border-slate-200/40 dark:border-slate-700/40 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-200 hover:shadow-md">

          {/* Avatar */}

          <div className="relative h-12 w-12 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 rounded-xl flex items-center justify-center shadow-inner ring-2 ring-white/50 dark:ring-slate-800/50 overflow-hidden">

            {user?.profile_picture ? (

              <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />

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

    </aside>

  );

};



export default SidebarComponent;