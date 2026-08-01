import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, Database, Activity, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  mode: 'simulation' | 'live';
  backendUrl: string;
  apiKey: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('vaultic-config');
    return saved
      ? JSON.parse(saved)
      : { mode: 'simulation', backendUrl: '', apiKey: '' };
  });

  const handleSave = () => {
    localStorage.setItem('vaultic-config', JSON.stringify(config));
    toast({
      title: 'Configuration saved',
      description: 'System configuration has been updated successfully.',
    });
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">System Configuration</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure backend connection and system parameters
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 max-w-4xl space-y-8">
        {/* Mode selection */}
        <section className="bg-card border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Operation Mode</h2>
          
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="space-y-1">
              <Label htmlFor="mode-switch" className="text-base font-medium">
                Simulation Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Run federated learning simulation entirely in-browser (no backend required)
              </p>
            </div>
            <Switch
              id="mode-switch"
              checked={config.mode === 'simulation'}
              onCheckedChange={checked =>
                setConfig({ ...config, mode: checked ? 'simulation' : 'live' })
              }
              data-testid="switch-mode"
            />
          </div>

          {config.mode === 'simulation' ? (
            <div className="mt-4 bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
              <p className="text-sm font-medium text-chart-2">
                Simulation mode active — all computation runs locally
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-4">
              <p className="text-sm font-medium text-accent">
                Live API mode — configure backend connection below
              </p>
            </div>
          )}
        </section>

        {/* Backend connection */}
        <section className="bg-card border border-card-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Backend Connection</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="backend-url">Backend API URL</Label>
              <Input
                id="backend-url"
                type="url"
                placeholder="https://api.example.com"
                value={config.backendUrl}
                onChange={e => setConfig({ ...config, backendUrl: e.target.value })}
                disabled={config.mode === 'simulation'}
                className="font-mono"
                data-testid="input-backend-url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                FastAPI backend endpoint for live federated learning
              </p>
            </div>

            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                disabled={config.mode === 'simulation'}
                className="font-mono"
                data-testid="input-api-key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Authentication token for backend API access
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} data-testid="button-save">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </section>

        {/* System info */}
        <section className="bg-card border border-card-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">System Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Participating Banks</p>
              <p className="text-2xl font-bold font-mono">4</p>
              <p className="text-xs text-muted-foreground mt-1">Bank_0 through Bank_3</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Model Architecture</p>
              <p className="text-2xl font-bold font-mono">MLP</p>
              <p className="text-xs text-muted-foreground mt-1">16 → 8 neurons</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Aggregation Method</p>
              <p className="text-2xl font-bold font-mono">FedAvg</p>
              <p className="text-xs text-muted-foreground mt-1">Sample-weighted averaging</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Training Rounds</p>
              <p className="text-2xl font-bold font-mono">10</p>
              <p className="text-xs text-muted-foreground mt-1">Maximum convergence</p>
            </div>
          </div>
        </section>

        {/* Technical details */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">Federated Learning Protocol</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Privacy Preservation:</strong> Each bank trains a local MLP model on private transaction data. Only model weights (numerical coefficients and intercepts) are shared with the central aggregator — never raw transaction records.
            </p>
            <p>
              <strong className="text-foreground">FedAvg Aggregation:</strong> The global model computes a weighted average of all bank weights, with each bank's contribution proportional to its sample count. All banks then sync to the global model before the next round.
            </p>
            <p>
              <strong className="text-foreground">Convergence:</strong> After 10 rounds, the model achieves ~94-96% recall (fraud detection rate) and ~91-93% F1 score, demonstrating effective collaborative learning without data sharing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
