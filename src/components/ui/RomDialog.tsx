import React from 'react';
import { clsx } from 'clsx';

interface RomDialogProps {
  children: React.ReactNode;
  className?: string;
}

export const RomDialog: React.FC<RomDialogProps> = ({ children, className }) => {
  return (
    <div className={clsx('rom-dialog relative', className)}>
      {children}
    </div>
  );
};
