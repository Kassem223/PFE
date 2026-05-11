import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

export const About = () => {
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

  const benefits = [
    'Real-time management',
    'Scalable infrastructure',
    'Secure data handling',
    ' analytics & reporting',
  ]

  return (
    <section ref={sectionRef} id="about" className="relative py-24 md:py-32 px-4 md:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images */}
          <div className="order-2 md:order-1 animate-scale-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="/src/assets/img1.jpeg"
                  alt="Project Overview"
                  className="h-64 w-full object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 transform"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="/src/assets/img2.jpeg"
                  alt="System Architecture"
                  className="h-64 w-full object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2 space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                {t('about.title')}
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="heading-2 text-neutral-950 dark:text-neutral-50">
                {t('about.subtitle')}
              </h2>
            </div>

            {/* Quote */}
            <blockquote className="border-l-4 border-primary-500 pl-6 py-2">
              <p className="text-lg text-neutral-700 dark:text-neutral-300 font-medium italic leading-relaxed">
                "{t('about.quote')}"
              </p>
            </blockquote>

            {/* Description */}
            <p className="body-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t('about.description')}
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
