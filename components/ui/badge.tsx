import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'danger' | 'warning';
  className?: string;
}

export function Badge({
  variant = 'default',
  className,
  ...props
}: BadgeProps) {
  let variantClasses = '';

  switch (variant) {
    case 'default':
      variantClasses = 'bg-gray-800 text-white hover:bg-gray-700';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      break;
    case 'outline':
      variantClasses = 'border border-gray-300 text-gray-800 hover:bg-gray-100';
      break;
    case 'success':
      variantClasses = 'bg-green-100 text-green-800 hover:bg-green-200';
      break;
    case 'danger':
      variantClasses = 'bg-red-100 text-red-800 hover:bg-red-200';
      break;
    case 'warning':
      variantClasses = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      break;
    default:
      variantClasses = 'bg-gray-800 text-white hover:bg-gray-700';
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${variantClasses} ${className || ''}`}
      {...props}
    />
  );
}

export default Badge; 