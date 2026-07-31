import { Building2 } from 'lucide-react';
import { BankMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BankStatusCardProps {
  bank: BankMetrics;
  isTraining?: boolean;
  className?: string;
}

export function BankStatusCard({ bank, isTraining, className }: BankStatusCardProps) {
  const recallPercent = (bank.recall * 100).toFixed(1);
  const f1Percent = (bank.f1 * 100).toFixed(1);

  return (
    <div
      className={cn(
        'bg-card border border-card-border rounded-lg p-4 relative overflow-hidden',
        isTraining && 'border-primary',
        className
      )}
      data-testid={`bank-card-${bank.bankId}`}
    >
      {isTraining && (
        <div className="absolute inset-0 bg-primary/5 training-pulse pointer-events-none" />
      )}
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-mono font-semibold text-sm">{bank.bankId}</h3>
          </div>
          {isTraining && (
            <span className="text-xs font-medium text-primary animate-pulse">Training...</span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Recall (fraud caught)</span>
              <span className="font-mono font-semibold">{recallPercent}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-2 transition-all duration-500"
                style={{ width: `${recallPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">F1 Score</span>
              <span className="font-mono font-semibold">{f1Percent}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-1 transition-all duration-500"
                style={{ width: `${f1Percent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-medium">{bank.sampleCount.toLocaleString()}</span> samples
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
