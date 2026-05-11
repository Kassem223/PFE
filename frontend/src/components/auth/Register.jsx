import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Building2, Briefcase, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '../landing/ThemeToggle'
import { LanguageSwitcher } from '../landing/LanguageSwitcher'
import { Button } from '../common/Button'
import { Input, Label, FormGroup } from '../common/Form'
import { Alert } from '../common/UI'
import axios from 'axios'

export const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    mdp: '',
    role: 'user',
    jobtitle: '',
    departement: '',
    email: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.mdp !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (!formData.agreeToTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/api/users', {
        nom: formData.nom,
        prenom: formData.prenom,
        adresse: formData.adresse,
        mdp: formData.mdp,
        role: formData.role,
        jobtitle: formData.jobtitle,
        departement: formData.departement,
        email: formData.email,
      })

      if (response.status === 201 || response.status === 200) {
        // Don't store user yet, redirect to login
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const departments = [
    'IT',
    'RH',
    'Finance',
    'Marketing',
    'Ventes',
    'Opérations',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-glass border-b border-neutral-200 dark:border-neutral-800 py-4">
        <div className="container-max flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-premium p-0.5">
              <div className="w-full h-full rounded-[6px] bg-white dark:bg-neutral-950 flex items-center justify-center">
                <span className="text-lg font-bold text-gradient">V</span>
              </div>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">VEKTOR</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              {t('nav.signIn')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h1 className="heading-2 text-neutral-950 dark:text-neutral-50">
              {t('signUp.title')}
            </h1>
            <p className="body-lg text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
              {t('signUp.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="card-premium p-8 md:p-12 animate-scale-in">
            {/* Error Alert */}
            {error && <Alert variant="error" className="mb-6">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormGroup>
                  <Label htmlFor="prenom" required>
                    {t('form.firstName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      placeholder="Jean"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="nom" required>
                    {t('form.lastName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      placeholder="Dupont"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Email Field */}
              <FormGroup>
                <Label htmlFor="email" required>
                  {t('form.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jean.dupont@entreprise.com"
                    className="pl-10"
                  />
                </div>
              </FormGroup>

              {/* Department and Job Title */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormGroup>
                  <Label htmlFor="departement" required>
                    {t('form.department')}
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10 pointer-events-none" />
                    <select
                      id="departement"
                      name="departement"
                      value={formData.departement}
                      onChange={handleChange}
                      required
                      className="input pl-10 appearance-none"
                    >
                      <option value="">Sélectionnez un département</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="jobtitle">
                    {t('form.jobTitle')}
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="jobtitle"
                      name="jobtitle"
                      value={formData.jobtitle}
                      onChange={handleChange}
                      placeholder="Manager"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormGroup>
                  <Label htmlFor="mdp" required>
                    {t('form.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="mdp"
                      type="password"
                      name="mdp"
                      value={formData.mdp}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirmPassword" required>
                    {t('signUp.confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Terms Agreement */}
              <FormGroup>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-300 dark:border-neutral-600 text-primary-600 dark:text-primary-400 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 transition-colors"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Je reconnais avoir lu et accepté les{' '}
                    <a href="#" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                      conditions d'utilisation
                    </a>
                  </label>
                </div>
              </FormGroup>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="w-full group mt-8"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('signUp.createAccount')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                  ou
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Vous avez déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-500 mt-8">
            En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  )
}
