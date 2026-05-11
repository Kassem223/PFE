import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { ThemeToggle } from '../landing/ThemeToggle'
import { Button } from '../common/Button'
import { Input, Label, FormGroup } from '../common/Form'
import { Alert } from '../common/UI'
import axios from 'axios'

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
        navigate('/accueil')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={loginRef} className="min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-premium rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-warm rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-8 py-6 border-b border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-glass">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-premium p-0.5 group-hover:shadow-lg transition-all duration-300">
            <div className="w-full h-full rounded-[6px] bg-white dark:bg-neutral-950 flex items-center justify-center">
              <span className="text-lg font-bold text-gradient">V</span>
            </div>
          </div>
          <span className="font-bold text-neutral-900 dark:text-white text-lg">VEKTOR</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-max py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left - Branding & Info */}
          <div className="hidden lg:flex flex-col space-y-12 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex w-fit">
              <div className="badge-primary flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>Secure Access</span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="heading-1 text-neutral-950 dark:text-neutral-50">
                  Bienvenue sur <span className="text-gradient">VEKTOR</span>
                </h1>
                <p className="body-lg text-neutral-600 dark:text-neutral-400">
                  Accédez à votre espace de gestion des ressources avec une sécurité maximale et une interface intuitive.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: '🔒', title: 'Sécurisé', desc: 'Authentification sécurisée' },
                { icon: '⚡', title: 'Rapide', desc: 'Accès instantané' },
                { icon: '📊', title: 'Intuitif', desc: 'Interface moderne' },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-2xl font-bold text-gradient">100%</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Uptime</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">24/7</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Support</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">∞</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Scalable</p>
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="animate-scale-in">
            <div className="card-premium p-8 md:p-10 backdrop-blur-glass relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

              {/* Form Header */}
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {t('auth.welcome')}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('auth.loginDescription')}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="error" className="mb-6">
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <FormGroup>
                  <Label htmlFor="email" required>
                    {t('form.email')}
                  </Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within/input:text-primary-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="vous@entreprise.com"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                {/* Password Field */}
                <FormGroup>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="password" required>
                      {t('form.password')}
                    </Label>
                    <a
                      href="#forgot"
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </a>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within/input:text-primary-500 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  disabled={loading}
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t('auth.login')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -left-full group-hover:left-full transition-all duration-700" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                    Nouveau sur VEKTOR ?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('auth.createAccount')}{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    {t('auth.signUp')}
                  </Link>
                </p>
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            </div>

            {/* Floating elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  )
}
