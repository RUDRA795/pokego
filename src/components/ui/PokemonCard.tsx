import React from 'react';
import { clsx } from 'clsx';

interface PokemonCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ children, className }) => {
  return (
    <div className={clsx('pokemon-card', className)}>
      {children}
    </div>
  );
};
