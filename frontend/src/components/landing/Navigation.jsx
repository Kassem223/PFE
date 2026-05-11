import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X, ChevronDown } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'

export const Navigation = () => {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-glass border-b border-neutral-200/50 dark:border-neutral-800/50 py-3 shadow-sm'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container-max flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-premium p-0.5 shadow-sm group-hover:shadow-md transition-all duration-300">
              <div className="w-full h-full rounded-[6px] bg-white dark:bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent group-hover:from-primary-500/20 transition-all duration-300" />
                <span className="text-xl font-bold text-gradient relative z-10">V</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white transition-all duration-300">
                VEKTOR
              </h2>
              <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Management
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-8 text-sm font-medium">
              <a
                href="#about"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200 relative group"
              >
                {t('nav.about')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-premium group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#mission"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200 relative group"
              >
                {t('nav.whatWeDo')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-premium group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#features"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200 relative group"
              >
                {t('nav.resources')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-premium group-hover:w-full transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
              <a
                href="/login"
                className="btn btn-primary btn-sm"
              >
                {t('nav.signIn')}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 animate-fade-in">
          <div className="container-max py-6 flex flex-col gap-4">
            <a
              href="#about"
              className="px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </a>
            <a
              href="#mission"
              className="px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.whatWeDo')}
            </a>
            <a
              href="#features"
              className="px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.resources')}
            </a>
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <a href="/login" className="btn btn-primary btn-sm flex-1">
                {t('nav.signIn')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
