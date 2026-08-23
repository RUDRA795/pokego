import React from 'react';
import { clsx } from 'clsx';

interface HealthBarProps {
  current: number;
  max: number;
  className?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, className }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const healthClass = percentage > 50 ? '' : percentage > 20 ? 'medium' : 'low';

  return (
    <div className={clsx('health-bar', className)}>
      <div 
        className={clsx('health-bar-fill', healthClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
