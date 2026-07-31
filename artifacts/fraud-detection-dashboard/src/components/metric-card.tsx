import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <div className={cn('bg-card border border-card-border rounded-lg p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className={cn('text-3xl font-bold font-mono tracking-tight', valueClassName)}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-2">
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-chart-2',
              trend === 'down' && 'text-chart-5',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend === 'up' && '↑ Improving'}
            {trend === 'down' && '↓ Declining'}
            {trend === 'neutral' && '→ Stable'}
          </span>
        </div>
      )}
    </div>
  );
}
