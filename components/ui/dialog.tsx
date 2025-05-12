import React, { createContext, useContext, useState } from 'react';

type DialogContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Dialog({ children, defaultOpen = false }: DialogProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTrigger({ children, className }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();

  return (
    <button 
      className={className} 
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  const { open, setOpen } = useDialogContext();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      <div className={`relative bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto ${className || ''}`}>
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold ${className || ''}`}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 ${className || ''}`}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>
      {children}
    </div>
  );
}

interface DialogCloseProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogClose({ children, className }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  return (
    <button 
      className={className} 
      onClick={() => setOpen(false)}
    >
      {children}
    </button>
  );
} 