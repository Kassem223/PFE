import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { ThemeToggle } from '../landing/ThemeToggle'
import { Button } from '../common/Button'
import { Input, Label, FormGroup } from '../common/Form'
import { Alert } from '../common/UI'
import axios from 'axios'

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const loginRef = useRef(null)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      },
      { threshold: 0.1 }
    )
    if (loginRef.current) observer.observe(loginRef.current)
    return () => observer.disconnect()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email: formData.email,
        password: formData.password,
      })
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        const dest = location.state?.from && typeof location.state.from === 'string' ? location.state.from : '/accueil'
        navigate(dest, { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={loginRef} className="min-h-screen bg-[#161316] flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#2A2730]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-accent">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-white text-sm tracking-wide">VEKTOR</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#1E1B1F] border border-[#2A2730] rounded-2xl p-8 shadow-premium animate-fade-in-up">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">{t('auth.welcome')}</h1>
              <p className="text-sm text-[#A1A1AA]">{t('auth.loginDescription')}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  {t('signIn.email')} <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                  <input
                    id="email" type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="vous@entreprise.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white placeholder-[#52525B] focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-[#A1A1AA]">
                    {t('signIn.password')} <span className="text-accent">*</span>
                  </label>
                  <a href="#forgot" className="text-xs text-accent hover:text-accent-hover transition-colors">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                  <input
                    id="password" type="password" name="password" required
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#1A1720] border border-[#2A2730] rounded-lg text-white placeholder-[#52525B] focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-accent disabled:opacity-40 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion...</>
                ) : (
                  <>{t('auth.login')}<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A2730]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[#1E1B1F] text-xs text-[#52525B]">Nouveau sur VEKTOR ?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-[#71717A]">
                {t('auth.createAccount')}{' '}
                <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
                  {t('auth.signUp')}
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: '🔒', label: 'Sécurisé' },
              { icon: '⚡', label: 'Rapide' },
              { icon: '📊', label: 'Intuitif' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-xs text-[#71717A]">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
