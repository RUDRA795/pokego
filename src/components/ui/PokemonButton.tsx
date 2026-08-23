import React from 'react';
import { clsx } from 'clsx';

interface PokemonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger';
  children: React.ReactNode;
}

export const PokemonButton: React.FC<PokemonButtonProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'pokemon-button',
        {
          'pokemon-button-primary': variant === 'primary',
          'pokemon-button-success': variant === 'success',
          'pokemon-button-danger': variant === 'danger',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
