import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import i18n from './i18n'
import { initializeCategories } from './utils/initializeCategories'
import { Landing } from './components/landing/Landing'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { InvitedSignup } from './components/auth/InvitedSignup'
import { Accueil } from './components/accueil/Accueil'
import { Resources } from './components/resources/Resources'
import { ResourceDetail } from './components/resources/ResourceDetail'
import { EquipmentDetail } from './components/equipment/EquipmentDetail'
import { CommanderEquipement } from './components/equipement/CommanderEquipement'
import { MesCommandes } from './components/commandes/MesCommandes'
import { CategoryPage } from './components/category/CategoryPage'
import { Reservations } from './components/reservations/Reservations'
import { ManageReservations } from './components/reservations/ManageReservations'
import { Users } from './components/users/Users'
import Analyse from './components/analyse/Analyse'
import { AccountManagement } from './components/account/AccountManagement'
import NotificationsPage from './components/notifications/NotificationsPage'
import { InvitationResponse } from './components/invitations/InvitationResponse'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { CategoryManagement } from './components/admin/CategoryManagement'
import Layout from './components/layout/Layout'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Initialize dark mode from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }

    // Initialize static categories
    initializeCategories()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<InvitedSignup />} />
        <Route path="/invitation-response" element={<InvitationResponse />} />
        <Route path="/accueil" element={<Layout><Accueil /></Layout>} />
        <Route path="/commander-equipement" element={<Layout><CommanderEquipement /></Layout>} />
        <Route path="/mes-commandes" element={<Layout><MesCommandes /></Layout>} />
        <Route path="/category/:type" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/resources" element={<Layout><Resources /></Layout>} />
        <Route path="/resources/:id" element={<Layout><ResourceDetail /></Layout>} />
        <Route path="/resources/:id/equipment" element={<Layout><EquipmentDetail /></Layout>} />
        <Route path="/reservations" element={<Layout><Reservations /></Layout>} />
        <Route path="/manage-reservations" element={<Layout><ManageReservations /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/analyse" element={<Layout><Analyse /></Layout>} />
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/categories" element={<Layout><CategoryManagement /></Layout>} />
        <Route path="/account" element={<Layout><AccountManagement /></Layout>} />
        <Route path="/notification" element={<Layout><NotificationsPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
