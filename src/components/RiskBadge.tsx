import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md';
}

export function RiskBadge({ risk, size = 'md' }: RiskBadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full uppercase tracking-wide';
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  };

  const riskClasses = {
    low: 'bg-risk-low-bg text-risk-low',
    medium: 'bg-risk-medium-bg text-risk-medium',
    high: 'bg-risk-high-bg text-risk-high',
  };

  return (
    <span className={cn(baseClasses, sizeClasses[size], riskClasses[risk])}>
      {risk}
    </span>
  );
}
