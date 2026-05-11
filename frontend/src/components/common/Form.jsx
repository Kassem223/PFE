import React from 'react'

export const FormGroup = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
)

export const Label = ({ htmlFor, required = false, children, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-900 dark:text-gray-100 ${className}`}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
)

export const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange = () => {},
  className = '',
  ...props
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 ${className}`}
    {...props}
  />
)
