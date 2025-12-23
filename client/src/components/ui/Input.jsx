import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-white shadow-sm',
            'focus:ring-2 focus:ring-primary-100 focus:border-primary-500 hover:border-gray-400',
            error ? 'border-red-500 focus:ring-red-100 focus:border-red-500' : 'border-gray-200',
            Icon && 'pl-11',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={clsx(
            'w-full px-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-white shadow-sm appearance-none',
            'focus:ring-2 focus:ring-primary-100 focus:border-primary-500 hover:border-gray-400',
            error ? 'border-red-500' : 'border-gray-200',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full px-4 py-3 border rounded-xl outline-none transition-all duration-200 resize-none bg-white shadow-sm',
          'focus:ring-2 focus:ring-primary-100 focus:border-primary-500',
          error ? 'border-red-500' : 'border-gray-200',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
