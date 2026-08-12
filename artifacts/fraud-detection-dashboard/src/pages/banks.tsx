import { Database, TrendingUp, Award } from 'lucide-react';
import { useFederatedLearningContext } from '@/lib/federated-learning-provider';
import { formatBankName } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Banks() {
  const { state } = useFederatedLearningContext();
  const { banks, globalModel } = state;

  const totalSamples = banks.reduce((sum, b) => sum + b.sampleCount, 0);

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Bank Network Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Decentralized fraud detection across Bank 0, Bank 1, Bank 2, and Bank 3
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 space-y-8">
        {/* Summary stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Samples</p>
                <p className="text-2xl font-bold font-mono">{totalSamples.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Combined across all institutions</p>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Recall</p>
                <p className="text-2xl font-bold font-mono">
                  {(banks.reduce((sum, b) => sum + b.recall, 0) / banks.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Mean fraud detection rate</p>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg F1 Score</p>
                <p className="text-2xl font-bold font-mono">
                  {(banks.reduce((sum, b) => sum + b.f1, 0) / banks.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Model effectiveness</p>
          </div>
        </section>

        {/* Bank metrics table */}
        <section className="bg-card border border-card-border rounded-lg overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-semibold">Individual Bank Performance</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Round {globalModel.round} — All banks benefit from federated aggregation
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Institution</TableHead>
                <TableHead className="text-right">Sample Count</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1 Score</TableHead>
                <TableHead className="text-right">Weight Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map(bank => {
                const contribution = (bank.sampleCount / totalSamples * 100).toFixed(1);
                const bankName = formatBankName(bank.bankId);
                return (
                  <TableRow key={bank.bankId} data-testid={`bank-row-${bank.bankId}`}>
                    <TableCell className="font-semibold">{bankName}</TableCell>
                    <TableCell className="text-right font-mono">{bank.sampleCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{(bank.accuracy * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-mono">{(bank.precision * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-mono text-chart-2 font-semibold">
                      {(bank.recall * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">{(bank.f1 * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${contribution}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm w-12 text-right">{contribution}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        {/* Metric bars */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">Performance Comparison</h2>
          <div className="space-y-6">
            {/* Recall comparison */}
            <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Recall (Fraud Detection Rate)</h3>
              <div className="space-y-3">
                {banks.map(bank => {
                  const bankName = formatBankName(bank.bankId);
                  return (
                    <div key={bank.bankId} className="flex items-center gap-4">
                      <span className="font-medium text-sm w-28">{bankName}</span>
                      <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full bg-chart-2 flex items-center justify-end px-3 transition-all duration-500"
                          style={{ width: `${bank.recall * 100}%` }}
                        >
                          <span className="text-xs font-mono font-semibold text-white">
                            {(bank.recall * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* F1 comparison */}
            <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">F1 Score</h3>
              <div className="space-y-3">
                {banks.map(bank => {
                  const bankName = formatBankName(bank.bankId);
                  return (
                    <div key={bank.bankId} className="flex items-center gap-4">
                      <span className="font-medium text-sm w-28">{bankName}</span>
                      <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full bg-chart-1 flex items-center justify-end px-3 transition-all duration-500"
                          style={{ width: `${bank.f1 * 100}%` }}
                        >
                          <span className="text-xs font-mono font-semibold text-white">
                            {(bank.f1 * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FedAvg explanation */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 shadow-xs">
          <h3 className="font-semibold mb-2 text-primary">Federated Averaging (FedAvg)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Each bank's contribution to the global model is weighted by its sample count. Banks with larger datasets have proportionally more influence on the aggregated weights.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {banks.map(bank => {
              const weight = (bank.sampleCount / totalSamples * 100).toFixed(1);
              const bankName = formatBankName(bank.bankId);
              return (
                <div key={bank.bankId} className="text-center bg-card/60 p-3 rounded-lg border border-border/50">
                  <p className="font-mono font-semibold text-lg">{weight}%</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{bankName}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
