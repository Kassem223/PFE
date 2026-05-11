import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Shield, Smartphone } from 'lucide-react'

export const Mission = () => {
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

  const steps = [
    {
      step: '01',
      icon: Zap,
      title: t('mission.step1.title'),
      description: t('mission.step1.description'),
      color: 'primary',
    },
    {
      step: '02',
      icon: Shield,
      title: t('mission.step2.title'),
      description: t('mission.step2.description'),
      color: 'accent',
    },
    {
      step: '03',
      icon: Smartphone,
      title: t('mission.step3.title'),
      description: t('mission.step3.description'),
      color: 'primary',
    },
  ]

  return (
    <section ref={sectionRef} id="mission" className="relative py-24 md:py-32 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <h2 className="heading-2 text-neutral-950 dark:text-neutral-50">
            {t('mission.title')}
          </h2>
          <p className="body-lg max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
            {t('mission.subtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon
            const isAccent = item.color === 'accent'
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card */}
                <div className="card-premium h-full flex flex-col p-8 relative overflow-hidden hover-lift">
                  {/* Background gradient */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl group-hover:from-primary-500/20 transition-all duration-500" />

                  {/* Step Number */}
                  <div className="text-6xl font-bold text-neutral-200 dark:text-neutral-800 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 transition-colors absolute top-6 right-6">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg ${
                    isAccent
                      ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400'
                      : 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  } flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between flex-1 mt-6 relative z-10">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                        {item.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Learn More Link */}
                    <div className="pt-6 mt-auto">
                      <a
                        href="#"
                        className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        Learn more →
                      </a>
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
