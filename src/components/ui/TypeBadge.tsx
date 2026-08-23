import React from 'react';
import { clsx } from 'clsx';
import { PokemonType } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  const theme = POKEMON_TYPE_THEMES[type];

  return (
    <span
      className={clsx('type-badge', className)}
      style={{
        backgroundColor: theme.primaryColor,
        color: theme.textColor,
        borderColor: theme.borderColor
      }}
    >
      {type}
    </span>
  );
};
