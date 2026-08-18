import { Activity, Play, SkipForward, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useFederatedLearningContext } from '@/lib/federated-learning-provider';
import { MetricCard } from '@/components/metric-card';
import { BankStatusCard } from '@/components/bank-status-card';
import { TrainingAnimation } from '@/components/training-animation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CommandCenter() {
  const { state, runOneRound, runAllRounds, resetSystem, isRunning } = useFederatedLearningContext();
  const { globalModel, banks, roundHistory, status } = state;

  const canRunNext = globalModel.round < 10 && status !== 'training';
  const isComplete = status === 'complete' || globalModel.round >= 10;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Privacy-preserving fraud detection across Bank 0, Bank 1, Bank 2, and Bank 3
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSystem}
                disabled={isRunning}
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset System
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 space-y-8">
        {/* Architecture Flow Card */}
        <section className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Federated Learning Architecture Flow</h2>
              <p className="text-xs text-muted-foreground mt-0.5">End-to-end privacy-preserving transaction scoring pipeline</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              Zero Data Exposure
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-center">
            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">🏦</div>
              <p className="text-xs font-semibold">Participating Banks</p>
              <p className="text-[10px] text-muted-foreground">Bank 0, 1, 2, 3</p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">🧠</div>
              <p className="text-xs font-semibold">Local Training</p>
              <p className="text-[10px] text-muted-foreground">5 Epochs / SMOTE</p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">🛡️</div>
              <p className="text-xs font-semibold">Diff. Privacy</p>
              <p className="text-[10px] text-muted-foreground">Gaussian Noise (ε=1.0)</p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50 group relative">
              <div className="text-xl mb-1">🔐</div>
              <p className="text-xs font-semibold">SecAgg Mask</p>
              <p className="text-[10px] text-muted-foreground">δ &lt; 10⁻⁹ Exact</p>
              <p className="text-[9px] text-muted-foreground/80 leading-tight mt-0.5">
                Algorithmic mask-cancellation verified locally. Production deployment would add multi-party cryptographic key exchange.
              </p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">⚡</div>
              <p className="text-xs font-semibold">FedAvg Aggregation</p>
              <p className="text-[10px] text-muted-foreground">Sample-Weighted Avg</p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">🌐</div>
              <p className="text-xs font-semibold">Global AI Model</p>
              <p className="text-[10px] text-muted-foreground">MLP (16 → 8)</p>
            </div>

            <div className="bg-background/80 border border-border/80 rounded-lg p-3 text-center transition-all hover:border-primary/50">
              <div className="text-xl mb-1">🎯</div>
              <p className="text-xs font-semibold">Fraud Detection</p>
              <p className="text-[10px] text-muted-foreground">Live /score Evaluation</p>
            </div>
          </div>
        </section>

        {/* Global model glance status */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Global Model Glance Summary</h2>
              <p className="text-xs text-muted-foreground mt-0.5">High-level model telemetry — see Global Model page for full performance matrix</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/global-model" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                View full model metrics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    status === 'idle' && 'bg-muted-foreground',
                    status === 'training' && 'bg-chart-3 animate-pulse',
                    status === 'complete' && 'bg-chart-2'
                  )}
                />
                <span className="text-sm font-medium font-mono">
                  {status === 'idle' && 'Ready'}
                  {status === 'training' && 'Training in progress'}
                  {status === 'complete' && 'Training complete'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Current Round"
              value={`${globalModel.round}/10`}
              icon={Activity}
              subtitle={isComplete ? 'Training complete' : `${10 - globalModel.round} rounds remaining`}
              valueClassName="text-primary"
            />
            <MetricCard
              label="Accuracy"
              value={`${(globalModel.accuracy * 100).toFixed(1)}%`}
              subtitle="Overall true classification"
              trend={globalModel.round > 0 ? 'up' : 'neutral'}
              valueClassName="text-foreground"
            />
            <MetricCard
              label="Recall (Fraud Detection Rate)"
              value={`${(globalModel.recall * 100).toFixed(1)}%`}
              subtitle="Actual fraud caught across network"
              trend={globalModel.round > 0 ? 'up' : 'neutral'}
              valueClassName={globalModel.recall > 0.8 ? 'text-chart-2' : ''}
            />
          </div>
        </section>

        {/* Training controls */}
        <section className="bg-card border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Training Controls</h2>
          
          {status === 'training' && <TrainingAnimation />}
          
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={runOneRound}
              disabled={!canRunNext}
              data-testid="button-run-one-round"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Next Round
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={runAllRounds}
              disabled={!canRunNext}
              data-testid="button-run-all-rounds"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Run All Rounds
            </Button>
            {isComplete && (
              <div className="flex items-center gap-2 ml-4 text-chart-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Model training complete</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Each round: Banks train locally → share weights → FedAvg aggregation → model sync
          </p>
        </section>

        {/* Bank network status */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Participating Banks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {banks.map(bank => (
              <BankStatusCard
                key={bank.bankId}
                bank={bank}
                isTraining={status === 'training'}
              />
            ))}
          </div>
        </section>

        {/* Privacy notice */}
        <section className="bg-accent/10 border border-accent/20 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-accent-foreground">Privacy Vault Active</h3>
          <p className="text-sm text-muted-foreground">
            All training occurs on local bank infrastructure. Only model weights (numerical coefficients) are shared — never raw transaction data. This dashboard simulates the federated aggregation protocol in-browser for demonstration purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
