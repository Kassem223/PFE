import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap, Users, Gauge, Lock } from 'lucide-react'

export const Features = () => {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Gauge,
      title: t('features.meetingHalls'),
      description: t('features.fullControl'),
      image: '/src/assets/salle_de_reunion.webp',
      color: 'primary',
    },
    {
      icon: Users,
      title: t('features.corporateFleet'),
      description: 'Gestion complète de la flotte',
      image: '/src/assets/flotte_d\'entreprise.webp',
      color: 'accent',
    },
    {
      icon: Zap,
      title: t('features.projectors'),
      description: 'Équipements audiovisuels avancés',
      image: '/src/assets/projecteur.jpg',
      color: 'primary',
    },
    {
      icon: Lock,
      title: t('features.interactiveScreens'),
      description: 'Technologie d\'affichage interactive',
      image: '/src/assets/ecran_interactif.jpg',
      color: 'accent',
    },
  ]

  return (
    <section ref={sectionRef} id="features" className="relative py-24 md:py-32 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        {/* Section Header */}
        <div className="grid md:grid-cols-2 gap-12 items-end mb-20">
          <div className="space-y-4">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
              {t('features.subtitle')}
            </span>
            <h2 className="heading-2 text-neutral-950 dark:text-neutral-50">
              {t('features.title')}
            </h2>
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 font-semibold flex items-center gap-2 group transition-colors"
            >
              {t('features.viewSpecs')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card */}
                <div className="card-premium h-80 overflow-hidden flex flex-col cursor-pointer hover-lift">
                  {/* Image Background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent group-hover:from-neutral-900/90 transition-all duration-300" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg ${
                      feature.color === 'primary'
                        ? 'bg-primary-500/20 group-hover:bg-primary-500/30'
                        : 'bg-accent-500/20 group-hover:bg-accent-500/30'
                    } flex items-center justify-center transition-colors duration-300`}>
                      <Icon className={`w-6 h-6 ${
                        feature.color === 'primary'
                          ? 'text-primary-500'
                          : 'text-accent-500'
                      }`} />
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
