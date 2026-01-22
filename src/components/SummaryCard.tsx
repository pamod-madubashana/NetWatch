import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; isUp: boolean };
  className?: string;
}

export function SummaryCard({ title, value, icon: Icon, trend, className }: SummaryCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-4 card-hover',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-1',
              trend.isUp ? 'text-risk-medium' : 'text-risk-low'
            )}>
              {trend.isUp ? '↑' : '↓'} {trend.value} from last scan
            </p>
          )}
        </div>
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
