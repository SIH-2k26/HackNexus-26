import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useFederatedLearningContext } from '@/lib/federated-learning-provider';
import { TransactionInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function Checker() {
  const { state, scoreTransaction } = useFederatedLearningContext();
  const { globalModel } = state;

  const [input, setInput] = useState<TransactionInput>({
    amount: 15000,
    frequency: 3,
    accountAge: 730,
    crossBankActivity: 1,
    velocity: 2,
    unusualHour: false,
    newDevice: false,
  });

  const [result, setResult] = useState<ReturnType<typeof scoreTransaction> | null>(null);

  const handleScore = () => {
    const score = scoreTransaction(input);
    setResult(score);
  };

  const loadFraudExample = () => {
    setInput({
      amount: 185000,
      frequency: 22,
      accountAge: 45,
      crossBankActivity: 8,
      velocity: 15,
      unusualHour: true,
      newDevice: true,
    });
    setResult(null);
  };

  const loadNormalExample = () => {
    setInput({
      amount: 8500,
      frequency: 2,
      accountAge: 1825,
      crossBankActivity: 0,
      velocity: 1,
      unusualHour: false,
      newDevice: false,
    });
    setResult(null);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Live Fraud Checker</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Score transactions using the trained federated model (Round {globalModel.round}/10)
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 max-w-5xl">
        {globalModel.round === 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent-foreground">Model Not Yet Trained</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The global model has not been trained. Predictions will be unreliable until at least 3 rounds are complete.
                Visit the Command Center to start training.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input form */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Transaction Input</h2>
              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="sm" onClick={loadFraudExample} data-testid="button-fraud-example">
                  Load Fraud Example
                </Button>
                <Button variant="outline" size="sm" onClick={loadNormalExample} data-testid="button-normal-example">
                  Load Normal Example
                </Button>
              </div>
            </div>

            <div className="space-y-4 bg-card border border-card-border rounded-lg p-6">
              <div>
                <Label htmlFor="amount">Transaction Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={input.amount}
                  onChange={e => setInput({ ...input, amount: Number(e.target.value) })}
                  className="font-mono"
                  data-testid="input-amount"
                />
                <p className="text-xs text-muted-foreground mt-1">Higher amounts increase risk</p>
              </div>

              <div>
                <Label htmlFor="frequency">Transaction Frequency (per month)</Label>
                <Input
                  id="frequency"
                  type="number"
                  value={input.frequency}
                  onChange={e => setInput({ ...input, frequency: Number(e.target.value) })}
                  className="font-mono"
                  data-testid="input-frequency"
                />
                <p className="text-xs text-muted-foreground mt-1">Very high frequency is suspicious</p>
              </div>

              <div>
                <Label htmlFor="accountAge">Account Age (days)</Label>
                <Input
                  id="accountAge"
                  type="number"
                  value={input.accountAge}
                  onChange={e => setInput({ ...input, accountAge: Number(e.target.value) })}
                  className="font-mono"
                  data-testid="input-account-age"
                />
                <p className="text-xs text-muted-foreground mt-1">Newer accounts are riskier</p>
              </div>

              <div>
                <Label htmlFor="crossBank">Cross-Bank Activity (count)</Label>
                <Input
                  id="crossBank"
                  type="number"
                  value={input.crossBankActivity}
                  onChange={e => setInput({ ...input, crossBankActivity: Number(e.target.value) })}
                  className="font-mono"
                  data-testid="input-cross-bank"
                />
                <p className="text-xs text-muted-foreground mt-1">Multiple banks increase risk</p>
              </div>

              <div>
                <Label htmlFor="velocity">Transaction Velocity (per hour)</Label>
                <Input
                  id="velocity"
                  type="number"
                  value={input.velocity}
                  onChange={e => setInput({ ...input, velocity: Number(e.target.value) })}
                  className="font-mono"
                  data-testid="input-velocity"
                />
                <p className="text-xs text-muted-foreground mt-1">Rapid transactions flag fraud</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="unusualHour">Unusual Hour Transaction</Label>
                <Switch
                  id="unusualHour"
                  checked={input.unusualHour}
                  onCheckedChange={checked => setInput({ ...input, unusualHour: checked })}
                  data-testid="switch-unusual-hour"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="newDevice">New Device</Label>
                <Switch
                  id="newDevice"
                  checked={input.newDevice}
                  onCheckedChange={checked => setInput({ ...input, newDevice: checked })}
                  data-testid="switch-new-device"
                />
              </div>

              <Button className="w-full mt-4" size="lg" onClick={handleScore} data-testid="button-score">
                <Shield className="w-4 h-4 mr-2" />
                Score Transaction
              </Button>
            </div>
          </section>

          {/* Results */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">Fraud Assessment</h2>

            {result ? (
              <div className="space-y-4">
                {/* Verdict */}
                <div
                  className={cn(
                    'rounded-lg p-6 border-2',
                    result.isFraud
                      ? 'bg-destructive/10 border-destructive'
                      : 'bg-chart-2/10 border-chart-2'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {result.isFraud ? (
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-chart-2" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">
                        {result.isFraud ? 'FRAUD DETECTED' : 'CLEAR'}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        Confidence: {result.confidence}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Fraud Probability</p>
                    <div className="h-3 bg-background rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          result.fraudProbability > 0.7 ? 'bg-destructive' :
                          result.fraudProbability > 0.4 ? 'bg-accent' :
                          'bg-chart-2'
                        )}
                        style={{ width: `${result.fraudProbability * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">0%</span>
                      <span className={cn(
                        "text-sm font-mono font-bold",
                        result.isFraud ? 'text-destructive' : 'text-chart-2'
                      )}>
                        {(result.fraudProbability * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">100%</span>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-card border border-card-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Analysis Factors</h3>
                  <ul className="space-y-2">
                    {result.explanation.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Model info */}
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Model Round</p>
                      <p className="font-mono font-semibold">{globalModel.round}/10</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Global Recall</p>
                      <p className="font-mono font-semibold">{(globalModel.recall * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence Level</p>
                      <p className="font-mono font-semibold capitalize">{result.confidence}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Threshold</p>
                      <p className="font-mono font-semibold">50.0%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-lg p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter transaction details and click Score to analyze
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
