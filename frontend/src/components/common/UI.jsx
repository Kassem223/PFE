import React from 'react'

export const Alert = ({ variant = 'info', children, className = '' }) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    error: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    success: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  }

  return (
    <div className={`rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
