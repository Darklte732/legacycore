import React, { createContext, useContext, ComponentProps } from 'react';

const FormContext = createContext({});

export const Form = ({ children, ...props }) => {
  return (
    <FormContext.Provider value={{}}>
      <form {...props}>{children}</form>
    </FormContext.Provider>
  );
};

Form.DisplayName = 'Form';

export const FormField = ({ children, ...props }) => {
  return <div className="mb-4" {...props}>{children}</div>;
};

FormField.DisplayName = 'FormField';

export const FormLabel = ({ children, ...props }) => {
  return (
    <label className="block text-sm font-medium mb-1" {...props}>
      {children}
    </label>
  );
};

FormLabel.DisplayName = 'FormLabel';

export const FormMessage = ({ children, ...props }) => {
  return (
    <p className="text-sm text-red-500 mt-1" {...props}>
      {children}
    </p>
  );
};

FormMessage.DisplayName = 'FormMessage';

export default {
  Form,
  FormField,
  FormLabel,
  FormMessage,
}; 