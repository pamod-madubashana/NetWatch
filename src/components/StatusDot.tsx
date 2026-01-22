import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'healthy' | 'warning' | 'error';
  showLabel?: boolean;
}

export function StatusDot({ status, showLabel = false }: StatusDotProps) {
  const statusClasses = {
    healthy: 'bg-status-healthy',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
  };

  const statusLabels = {
    healthy: 'All systems normal',
    warning: 'Some issues detected',
    error: 'Critical issues',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn('w-2 h-2 rounded-full animate-pulse-glow', statusClasses[status])} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
      )}
    </div>
  );
}
