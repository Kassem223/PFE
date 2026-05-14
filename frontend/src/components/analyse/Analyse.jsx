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
      <div className="min-h-screen bg-[#161316] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2A2730] border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161316] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-[#161316] p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#A1A1AA] text-sm">Impossible de charger les données</p>
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
      <div className="min-h-screen bg-[#161316] p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Administration</p>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tableau de Bord</h1>
              <p className="text-sm text-[#A1A1AA] mt-0.5">Statistiques complètes des comptes et activités</p>
            </div>
            <button onClick={handleExportPDF} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1B1F] border border-[#2A2730] hover:border-[#3A3740] text-[#A1A1AA] hover:text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40">
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Exporter PDF'}
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Database,  color: 'blue',   label: 'Comptes',          value: stats.totalAccounts?.[0]?.count || 0 },
              { icon: UserCog,   color: 'green',  label: 'Managers',         value: stats.managerAccounts?.[0]?.count || 0 },
              { icon: ShieldCheck,color:'purple', label: 'Admins',           value: stats.adminAccounts?.[0]?.count || 0 },
              { icon: User,      color: 'indigo', label: 'Utilisateurs',     value: stats.userAccounts?.[0]?.count || 0 },
              { icon: UserPlus,  color: 'amber',  label: 'Nouveaux (30j)',   value: stats.recentAccounts?.[0]?.count || 0 },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 hover:border-[#3A3740] transition-all duration-200">
                <div className={`w-9 h-9 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-3`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Calendar,     color: 'emerald', label: 'Total réservations',  value: stats.totalReservations?.[0]?.count || 0 },
              { icon: CheckCircle,  color: 'blue',    label: 'Réservations actives', value: stats.activeReservations?.[0]?.count || 0 },
              { icon: Package,      color: 'orange',  label: 'Équipements',          value: stats.equipementCount?.[0]?.count || 0 },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 hover:border-[#3A3740] transition-all duration-200">
                <div className={`w-9 h-9 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-3`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { id: 'chart-accounts-role', title: 'Comptes par Rôle', file: 'comptes-par-role.pdf',
                chart: (
                  <PieChart>
                    <Pie data={(stats.accountsByRole||[]).map(i=>({...i,name:getRoleName(i.name||i.role)}))} cx="50%" cy="50%" labelLine={false} label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                      {(stats.accountsByRole||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie><Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/>
                  </PieChart>
                )},
              { id: 'chart-reservations-role', title: 'Réservations par Rôle', file: 'reservations-par-role.pdf',
                chart: (
                  <PieChart>
                    <Pie data={(stats.reservationsByCreatorRole||[]).map(i=>({...i,count:Number(i.count),creator_role:getRoleName(i.creator_role)}))} cx="50%" cy="50%" labelLine={false} label={({creator_role,percent})=>`${creator_role}: ${(percent*100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                      {(stats.reservationsByCreatorRole||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie><Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/>
                  </PieChart>
                )},
              { id: 'chart-monthly-registrations', title: 'Inscriptions Mensuelles', file: 'inscriptions-mensuelles.pdf',
                chart: (
                  <LineChart data={stats.monthlyRegistrations.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2730"/><XAxis dataKey="month" stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/><YAxis stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/><Legend wrapperStyle={{color:'#A1A1AA',fontSize:12}}/>
                    <Line type="monotone" dataKey="count" stroke="#FF6D29" strokeWidth={2} dot={{fill:'#FF6D29',r:3}} name="Inscriptions"/>
                  </LineChart>
                )},
              { id: 'chart-department-performance', title: 'Performance par Département', file: 'performance-departement.pdf',
                chart: (
                  <BarChart data={stats.departmentActivity||[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2730"/><XAxis dataKey="departement" stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/><YAxis stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/><Legend wrapperStyle={{color:'#A1A1AA',fontSize:12}}/>
                    <Bar dataKey="user_count" fill="#8b5cf6" name="Utilisateurs" radius={[4,4,0,0]}/>
                    <Bar dataKey="reservation_count" fill="#22c55e" name="Réservations" radius={[4,4,0,0]}/>
                  </BarChart>
                )},
            ].map(c => (
              <div key={c.id} className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                  <button onClick={()=>handleExportChart(c.id,c.file,c.title)} disabled={exporting}
                    className="p-1.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#252229] transition-all disabled:opacity-40">
                    <Download className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <div id={c.id}><ResponsiveContainer width="100%" height={260}>{c.chart}</ResponsiveContainer></div>
              </div>
            ))}

            {/* Top Active Users */}
            <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-4">Utilisateurs les Plus Actifs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2A2730]">
                      {['Nom','Rôle','Réservations','Dernière activité'].map(h=>(
                        <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-[#71717A] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topActiveUsers.map((u,i)=>(
                      <tr key={i} className="border-b border-[#2A2730]/50 hover:bg-[#252229] transition-colors">
                        <td className="py-3 px-3 text-sm text-white font-medium">{u.prenom} {u.nom}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${u.role==='admin'?'bg-purple-500/10 text-purple-400 border border-purple-500/20':u.role==='manager'?'bg-blue-500/10 text-blue-400 border border-blue-500/20':'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-[#A1A1AA]">{u.reservation_count}</td>
                        <td className="py-3 px-3 text-sm text-[#71717A]">{u.last_activity?new Date(u.last_activity).toLocaleDateString('fr-FR'):'Jamais'}</td>
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
      <div className="min-h-screen bg-[#161316] p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Gestion</p>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tableau de Bord</h1>
              <p className="text-sm text-[#A1A1AA] mt-0.5">Statistiques des utilisateurs et réservations</p>
            </div>
            <button onClick={handleExportPDF} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1B1F] border border-[#2A2730] hover:border-[#3A3740] text-[#A1A1AA] hover:text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40">
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Exporter PDF'}
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: User,        color: 'blue',    label: 'Utilisateurs',         value: stats.userAccounts?.[0]?.count || 0 },
              { icon: Calendar,    color: 'green',   label: 'Total réservations',   value: stats.totalReservations?.[0]?.count || 0 },
              { icon: CheckCircle, color: 'amber',   label: 'Réservations actives', value: stats.activeReservations?.[0]?.count || 0 },
              { icon: Package,     color: 'purple',  label: 'Équipements',          value: stats.equipementCount?.[0]?.count || 0 },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 hover:border-[#3A3740] transition-all duration-200">
                <div className={`w-9 h-9 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-3`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Réservations par Statut</h3>
                <button onClick={()=>handleExportChart('chart-reservations-status','reservations-par-statut.pdf','Réservations par Statut')} disabled={exporting} className="p-1.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#252229] transition-all disabled:opacity-40"><Download className="w-3.5 h-3.5"/></button>
              </div>
              <div id="chart-reservations-status">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                      {statusData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Réservations Mensuelles</h3>
                <button onClick={()=>handleExportChart('chart-monthly-reservations','reservations-mensuelles.pdf','Réservations Mensuelles')} disabled={exporting} className="p-1.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#252229] transition-all disabled:opacity-40"><Download className="w-3.5 h-3.5"/></button>
              </div>
              <div id="chart-monthly-reservations">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={(stats.reservationsByMonth||[]).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2730"/><XAxis dataKey="month" stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/><YAxis stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/><Legend wrapperStyle={{color:'#A1A1AA',fontSize:12}}/>
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{fill:'#22c55e',r:3}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Équipements Populaires</h3>
                <button onClick={()=>handleExportChart('chart-popular-equipment','equipements-populaires.pdf','Équipements Populaires')} disabled={exporting} className="p-1.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#252229] transition-all disabled:opacity-40"><Download className="w-3.5 h-3.5"/></button>
              </div>
              <div id="chart-popular-equipment">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.popularEquipment||[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2730"/><XAxis dataKey="nom" stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/><YAxis stroke="#52525B" tick={{fill:'#71717A',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1E1B1F',border:'1px solid #2A2730',borderRadius:'8px',color:'#fff'}}/><Legend wrapperStyle={{color:'#A1A1AA',fontSize:12}}/>
                    <Bar dataKey="reservation_count" fill="#8b5cf6" name="Réservations" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {stats.upcomingReservations > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Réservations à venir</p>
                <p className="text-xs text-[#A1A1AA]">{stats.upcomingReservations} réservations prévues pour les 7 prochains jours</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161316] p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-xl font-bold text-white mb-2">Accès Non Autorisé</h1>
        <p className="text-sm text-[#A1A1AA]">Vous n'avez pas les permissions nécessaires.</p>
      </div>
    </div>
  );
};

export default Analyse;
