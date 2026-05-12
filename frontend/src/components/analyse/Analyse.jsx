import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Calendar, Settings, UserCheck, Briefcase, Activity, Clock, Download, ShieldCheck, UserCog, UserPlus, User, Package, Database, CheckCircle } from 'lucide-react';
import { exportDashboardToPDF, exportChartToPDF } from '../../utils/pdfExport';

const Analyse = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStatistics(parsedUser.role);
    }
  }, []);

  const fetchStatistics = async (userRole) => {
    try {
      setLoading(true);
      console.log('Fetching statistics for role:', userRole);
      
      // Handle multiple admin role variations
      const isAdmin = userRole === 'administrateur' || userRole === 'admin';
      const endpoint = isAdmin ? '/api/statistics/admin' : '/api/statistics/manager';
      console.log('Using endpoint:', endpoint);
      
      const response = await axios.get(`http://localhost:3000${endpoint}`);
      console.log('API Response received:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      setStats(response.data);
      console.log('Stats set successfully');
    } catch (err) {
      console.error('Error fetching statistics:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    const roleStr = String(role).toLowerCase();
    if (roleStr === 'admin' || roleStr === 'administrateur' || roleStr === '0') return 'Administrateur';
    if (roleStr === 'manager' || roleStr === 'gestionnaire' || roleStr === '1') return 'Gestionnaire';
    if (roleStr === 'user' || roleStr === 'utilisateur' || roleStr === '2') return 'Utilisateur';
    return role;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportDashboardToPDF(stats, user.role);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportChart = async (chartId, filename, title) => {
    setExporting(true);
    try {
      await exportChartToPDF(chartId, filename, title);
    } catch (err) {
      console.error('Error exporting chart:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    // Debug logging
    console.log('Debug - User:', user);
    console.log('Debug - Stats:', stats);
    console.log('Debug - User exists:', !!user);
    console.log('Debug - Stats exists:', !!stats);
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Unable to load user data</p>
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              <p>Debug Info:</p>
              <p>User: {user ? 'Loaded' : 'Not loaded'}</p>
              <p>Stats: {stats ? 'Loaded' : 'Not loaded'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusName = (status) => {
    if (status === undefined || status === null || status === '') return 'Confirmé';
    const s = String(status).toLowerCase().trim();
    if (s === '0' || s === 'en attente' || s === 'en_attente' || s === 'pending') return 'En attente';
    if (s === '1' || s === 'confirmée' || s === 'acceptée' || s === 'confirmed') return 'Confirmé';
    if (s === '2' || s === 'annulée' || s === 'refused' || s === 'cancelled') return 'Annulé';
    if (s === 'terminée' || s === 'completed') return 'Terminé';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusData = (stats.reservationsByStatus || []).map(entry => ({
    ...entry,
    name: getStatusName(entry.statut !== undefined ? entry.statut : entry.status)
  }));

  // Admin Statistics View
  if (user.role === 'administrateur' || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Export Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tableau de Bord Administrateur</h1>
              <p className="text-slate-600 dark:text-slate-400">Statistiques complètes des comptes, gestionnaires et activités</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export en cours...' : 'Exporter PDF'}
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              { icon: Database, color: 'blue', label: 'Nombre des comptes', value: stats.totalAccounts?.[0]?.count || 0 },
              { icon: UserCog, color: 'green', label: 'Nombre de managers', value: stats.managerAccounts?.[0]?.count || 0 },
              { icon: ShieldCheck, color: 'purple', label: "Nombre d'admins", value: stats.adminAccounts?.[0]?.count || 0 },
              { icon: User, color: 'indigo', label: "Nombre d'utilisateurs", value: stats.userAccounts?.[0]?.count || 0 },
              { icon: UserPlus, color: 'amber', label: 'Nouveaux comptes (30j)', value: stats.recentAccounts?.[0]?.count || 0 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right leading-tight pt-1 min-h-[2.5rem]">
                    {item.label}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Calendar, color: 'emerald', label: 'Total des réservations', value: stats.totalReservations?.[0]?.count || 0 },
              { icon: CheckCircle, color: 'blue', label: 'Réservations actives', value: stats.activeReservations?.[0]?.count || 0 },
              { icon: Package, color: 'orange', label: "Nombre d'équipements", value: stats.equipementCount?.[0]?.count || 0 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right leading-tight pt-1 min-h-[2.5rem]">
                    {item.label}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts by Role */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Comptes par Rôle</h3>
                <button
                  onClick={() => handleExportChart('chart-accounts-role', 'comptes-par-role.pdf', 'Comptes par Rôle')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-accounts-role">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(stats.accountsByRole || []).map(item => ({
                        ...item,
                        name: getRoleName(item.name || item.role)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(stats.accountsByRole || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reservations by Creator Role */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Réservations par Rôle de Créateur</h3>
                <button
                  onClick={() => handleExportChart('chart-reservations-role', 'reservations-par-role.pdf', 'Réservations par Rôle')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-reservations-role">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(stats.reservationsByCreatorRole || []).map(item => ({
                        ...item,
                        count: Number(item.count),
                        creator_role: getRoleName(item.creator_role)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ creator_role, percent }) => `${creator_role}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(stats.reservationsByCreatorRole || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Registrations */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inscriptions Mensuelles</h3>
                <button
                  onClick={() => handleExportChart('chart-monthly-registrations', 'inscriptions-mensuelles.pdf', 'Inscriptions Mensuelles')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-monthly-registrations">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyRegistrations.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Inscriptions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance par Département</h3>
                <button
                  onClick={() => handleExportChart('chart-department-performance', 'performance-departement.pdf', 'Performance par Département')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-department-performance">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.departmentActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departement" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="user_count" fill="#8b5cf6" name="Utilisateurs" />
                    <Bar dataKey="reservation_count" fill="#10b981" name="Réservations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Active Users */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Utilisateurs les Plus Actifs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 text-slate-700 dark:text-slate-300">Nom</th>
                      <th className="text-left py-2 px-2 text-slate-700 dark:text-slate-300">Rôle</th>
                      <th className="text-left py-2 px-2 text-slate-700 dark:text-slate-300">Réservations</th>
                      <th className="text-left py-2 px-2 text-slate-700 dark:text-slate-300">Dernière activité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topActiveUsers.map((user, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 px-2 text-slate-900 dark:text-white">{user.prenom} {user.nom}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                            user.role === 'manager' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-900 dark:text-white">{user.reservation_count}</td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                          {user.last_activity ? new Date(user.last_activity).toLocaleDateString('fr-FR') : 'Jamais'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manager Statistics View
  if (user.role === 'manager') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Export Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tableau de Bord Gestionnaire</h1>
              <p className="text-slate-600 dark:text-slate-400">Statistiques des utilisateurs et réservations</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export en cours...' : 'Exporter PDF'}
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: User, color: 'blue', label: "Nombre d'utilisateurs", value: stats.userAccounts?.[0]?.count || 0 },
              { icon: Calendar, color: 'green', label: 'Total des réservations', value: stats.totalReservations?.[0]?.count || 0 },
              { icon: CheckCircle, color: 'amber', label: 'Réservations actives', value: stats.activeReservations?.[0]?.count || 0 },
              { icon: Package, color: 'purple', label: "Nombre d'équipements", value: stats.equipementCount?.[0]?.count || 0 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right leading-tight pt-1 min-h-[2.5rem]">
                    {item.label}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reservations by Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Réservations par Statut</h3>
                <button
                  onClick={() => handleExportChart('chart-reservations-status', 'reservations-par-statut.pdf', 'Réservations par Statut')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-reservations-status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Reservations */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Réservations Mensuelles</h3>
                <button
                  onClick={() => handleExportChart('chart-monthly-reservations', 'reservations-mensuelles.pdf', 'Réservations Mensuelles')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-monthly-reservations">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(stats.reservationsByMonth || []).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Equipment */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Équipements Populaires</h3>
                <button
                  onClick={() => handleExportChart('chart-popular-equipment', 'equipements-populaires.pdf', 'Équipements Populaires')}
                  disabled={exporting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Exporter ce graphique"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div id="chart-popular-equipment">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.popularEquipment || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reservation_count" fill="#8b5cf6" name="Nombre de réservations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Upcoming Reservations Alert */}
          {stats.upcomingReservations > 0 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Réservations à venir</h3>
                  <p className="text-blue-700 dark:text-blue-300">{stats.upcomingReservations || 0} réservations prévues pour les 7 prochains jours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User role - no access
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Accès Non Autorisé</h1>
          <p className="text-slate-600 dark:text-slate-400">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    </div>
  );
};

export default Analyse;
