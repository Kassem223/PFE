import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Sparkles } from 'lucide-react'

export const Hero = () => {
  const { t } = useTranslation()
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      },
      { threshold: 0.1 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="relative pt-32 pb-24 px-4 md:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-premium rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-warm rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex">
              <div className="badge-primary flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span className="capitalize">{t('hero.badge')}</span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="heading-1 text-neutral-950 dark:text-neutral-50">
                {t('hero.headline')}
                <br />
                <span className="text-gradient">{t('hero.subheadline')}</span>
              </h1>
              <p className="body-lg max-w-xl">
                {t('hero.description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/login"
                className="btn btn-primary btn-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('hero.exploreDashboard')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -left-full group-hover:left-full transition-all duration-700" />
              </a>
              <a
                href="#features"
                className="btn btn-secondary btn-lg"
              >
                {t('hero.learnMore')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-2xl font-bold text-gradient">100%</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Uptime</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">24/7</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Support</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">∞</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Scalable</p>
              </div>
            </div>
          </div>

          {/* Right - Premium Mockup */}
          <div className="relative animate-scale-in">
            {/* Glass Card with Premium Design */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl opacity-0 group-hover:opacity-10 blur-lg transition-opacity duration-500" />
              
              {/* Main Card */}
              <div className="card-premium p-6 backdrop-blur-glass relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error-500" />
                    <div className="w-3 h-3 rounded-full bg-warning-500" />
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Dashboard</span>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  {/* Chart Preview */}
                  <div className="h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl border border-primary-200/20 dark:border-primary-700/20 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    <div className="relative z-10 text-center">
                      <div className="text-2xl font-bold text-gradient mb-1">Analytics</div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Real-time data visualization</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Resources</p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">1,234</p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Reservations</p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">567</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                    View Full Dashboard
                  </button>
                </div>

                {/* Bottom decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>

              {/* Floating elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
