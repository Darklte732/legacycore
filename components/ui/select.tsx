import React from 'react';

export const Select = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export const SelectItem = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <option ref={ref} {...props}>
      {children}
    </option>
  );
});

SelectItem.displayName = 'SelectItem';

export default {
  Select,
  SelectItem,
}; 