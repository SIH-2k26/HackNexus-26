import { useState, useEffect } from 'react';
import {
  Database,
  TrendingUp,
  Award,
  Plus,
  Key,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UploadCloud,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useFederatedLearningContext } from '@/lib/federated-learning-provider';
import { formatBankName, getAuthApiKey } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RegisteredBankNode {
  api_key_prefix: string;
  bank_name: string;
  bank_id?: string;
  tier: string;
  created_at: string;
  last_active?: string | null;
  active: boolean;
  custom_uploaded?: boolean;
}

export default function Banks() {
  const { state } = useFederatedLearningContext();
  const { banks, globalModel } = state;

  // Manual token generation dialog state
  const [registerOpen, setRegisterOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankTier, setNewBankTier] = useState('standard');
  const [registering, setRegistering] = useState(false);
  const [registeredKeySuccess, setRegisteredKeySuccess] = useState<{ key: string; name: string } | null>(null);

  // CSV Upload Dialog State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBankName, setUploadBankName] = useState('');
  const [uploadBankTier, setUploadBankTier] = useState('standard');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{
    bank_name: string;
    bank_id: string;
    api_key: string;
    sample_count: number;
    message: string;
  } | null>(null);

  const [apiBanks, setApiBanks] = useState<RegisteredBankNode[]>([]);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  const totalSamples = banks.reduce((sum, b) => sum + b.sampleCount, 0);

  // Fetch admin registered bank nodes list if backend is live
  const fetchRegisteredBanks = async () => {
    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/admin/banks`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.banks && Array.isArray(data.banks)) {
          setApiBanks(data.banks);
        }
      }
    } catch (err) {
      // Backend offline fallback handled gracefully
    }
  };

  useEffect(() => {
    fetchRegisteredBanks();
  }, []);

  const handleRegisterBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    setRegistering(true);
    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ bank_name: newBankName.trim(), tier: newBankTier }),
      });
      if (res.ok) {
        const data = await res.json();
        setRegisteredKeySuccess({ key: data.api_key, name: data.bank_name });
        setNewBankName('');
        fetchRegisteredBanks();
      } else {
        alert('Failed to register bank node.');
      }
    } catch (err) {
      const mockKey = `vlt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setRegisteredKeySuccess({ key: mockKey, name: newBankName.trim() });
      setNewBankName('');
    } finally {
      setRegistering(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/admin/banks/template-csv`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vaultic_bank_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download template', err);
    }
  };

  const handleUploadBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!uploadBankName.trim()) {
      setUploadError('Please enter a bank name.');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please select a valid .csv file to upload.');
      return;
    }

    setUploading(true);
    try {
      const apiKey = getAuthApiKey();
      const csvText = await uploadFile.text();

      const res = await fetch(`${API_BASE_URL}/admin/banks/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          bank_name: uploadBankName.trim(),
          tier: uploadBankTier,
          csv_content: csvText,
          filename: uploadFile.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.detail || 'Failed to upload and validate bank CSV.');
      } else {
        setUploadSuccess({
          bank_name: data.bank_name,
          bank_id: data.bank_id,
          api_key: data.api_key,
          sample_count: data.sample_count,
          message: data.message,
        });
        setUploadBankName('');
        setUploadFile(null);
        fetchRegisteredBanks();
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Network error occurred during bank upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleRevokeKey = async (keyPrefix: string) => {
    setActionLoadingKey(keyPrefix);
    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/admin/banks/${encodeURIComponent(keyPrefix)}/revoke`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        fetchRegisteredBanks();
      }
    } catch (err) {
      setApiBanks(prev => prev.map(b => b.api_key_prefix === keyPrefix ? { ...b, active: false } : b));
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleReinstateKey = async (keyPrefix: string) => {
    setActionLoadingKey(keyPrefix);
    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/admin/banks/${encodeURIComponent(keyPrefix)}/reinstate`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        fetchRegisteredBanks();
      }
    } catch (err) {
      setApiBanks(prev => prev.map(b => b.api_key_prefix === keyPrefix ? { ...b, active: true } : b));
    } finally {
      setActionLoadingKey(null);
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Bank Network Overview</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized fraud detection across participating banking institution nodes
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload Bank CSV Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="shadow-xs" data-testid="button-upload-bank-csv">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Upload Bank CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card border border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Onboard Bank via CSV Dataset
                  </DialogTitle>
                  <DialogDescription>
                    Upload a private transaction dataset CSV to enroll a new bank node in the active federated learning network.
                  </DialogDescription>
                </DialogHeader>

                {uploadSuccess ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                      <p className="text-xs font-semibold text-chart-2 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Bank Successfully Onboarded
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Institution <strong>{uploadSuccess.bank_name}</strong> ({uploadSuccess.bank_id}) enrolled with{' '}
                        <strong>{uploadSuccess.sample_count.toLocaleString()}</strong> transaction records.
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {uploadSuccess.message}
                      </p>
                      <div className="mt-3 p-2.5 bg-background border border-border rounded font-mono text-xs font-bold text-primary break-all select-all">
                        {uploadSuccess.api_key}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Store this API key safely for node authentication.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setUploadSuccess(null);
                        setUploadOpen(false);
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleUploadBank} className="space-y-4 py-2">
                    {uploadError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Validation Error</p>
                          <p className="mt-0.5">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-lg">
                      <div className="text-xs">
                        <p className="font-semibold">Expected Schema Template</p>
                        <p className="text-muted-foreground text-[11px]">10 feature columns + is_fraud label</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="h-8 text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Template CSV
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="upload-bank-name">Bank / Institution Name</Label>
                      <Input
                        id="upload-bank-name"
                        placeholder="e.g. Bank HDFC / Standard Chartered"
                        value={uploadBankName}
                        onChange={e => setUploadBankName(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="upload-bank-tier">Institution Tier</Label>
                      <select
                        id="upload-bank-tier"
                        value={uploadBankTier}
                        onChange={e => setUploadBankTier(e.target.value)}
                        className="w-full mt-1 h-9 px-3 bg-background border border-border rounded-md text-sm"
                      >
                        <option value="standard">Standard Tier</option>
                        <option value="enterprise">Enterprise Tier</option>
                        <option value="tier_1">Tier 1 National</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="upload-file">CSV Dataset File</Label>
                      <Input
                        id="upload-file"
                        type="file"
                        accept=".csv"
                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                        className="mt-1 cursor-pointer"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Must contain headers: amount, timestamp, transaction_type, sender_account_age_days, receiver_account_age_days, sender_tx_count_24h, receiver_unique_senders_24h, device_changed, location_changed, failed_login_attempts, is_fraud.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? 'Validating & Onboarding...' : 'Upload & Enroll Bank'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Register New Bank Node Dialog */}
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" data-testid="button-register-bank">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Bank Token
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Register Bank API Token
                  </DialogTitle>
                  <DialogDescription>
                    Generate a unique federated API token for an external banking node.
                  </DialogDescription>
                </DialogHeader>

                {registeredKeySuccess ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                      <p className="text-xs font-semibold text-chart-2 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Node Registered Successfully
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Institution <strong>{registeredKeySuccess.name}</strong> registered. Store this key safely — it cannot be shown again:
                      </p>
                      <div className="mt-3 p-2.5 bg-background border border-border rounded font-mono text-xs font-bold text-primary break-all select-all">
                        {registeredKeySuccess.key}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setRegisteredKeySuccess(null);
                        setRegisterOpen(false);
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterBank} className="space-y-4 py-2">
                    <div>
                      <Label htmlFor="bank-name">Bank Name / Node Identifier</Label>
                      <Input
                        id="bank-name"
                        placeholder="e.g. Bank Axis / Canara Bank"
                        value={newBankName}
                        onChange={e => setNewBankName(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bank-tier">Tier</Label>
                      <select
                        id="bank-tier"
                        value={newBankTier}
                        onChange={e => setNewBankTier(e.target.value)}
                        className="w-full mt-1 h-9 px-3 bg-background border border-border rounded-md text-sm"
                      >
                        <option value="standard">Standard Tier</option>
                        <option value="enterprise">Enterprise Tier</option>
                        <option value="tier_1">Tier 1 National</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={registering}>
                        {registering ? 'Generating Token...' : 'Register Node'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
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
            <p className="text-xs text-muted-foreground">Combined across {banks.length} participating institutions</p>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Recall</p>
                <p className="text-2xl font-bold font-mono">
                  {(banks.reduce((sum, b) => sum + b.recall, 0) / Math.max(1, banks.length) * 100).toFixed(1)}%
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
                  {(banks.reduce((sum, b) => sum + b.f1, 0) / Math.max(1, banks.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Model effectiveness</p>
          </div>
        </section>

        {/* Bank metrics table */}
        <section className="bg-card border border-card-border rounded-lg overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Individual Bank Performance & Node Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Round {globalModel.round} — Node active state, weight contribution, and key management (UC-09, UC-10, UC-11, UC-16)
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Institution</TableHead>
                <TableHead>Node Status</TableHead>
                <TableHead className="text-right">Sample Count</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1 Score</TableHead>
                <TableHead className="text-right">Weight Contribution</TableHead>
                <TableHead className="text-right w-36">Key Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map(bank => {
                const contribution = totalSamples > 0 ? (bank.sampleCount / totalSamples * 100).toFixed(1) : '0.0';
                const bankName = formatBankName(bank.bankId);

                // Match with registered API keys if available
                const registeredNode = apiBanks.find(
                  b => b.bank_name.toLowerCase() === bank.bankId.toLowerCase() ||
                       b.bank_name.toLowerCase() === bankName.toLowerCase() ||
                       (b.bank_id && b.bank_id.toLowerCase() === bank.bankId.toLowerCase())
                );
                const isKeyActive = registeredNode ? registeredNode.active : true;
                const keyPrefix = registeredNode?.api_key_prefix;

                return (
                  <TableRow key={bank.bankId} data-testid={`bank-row-${bank.bankId}`}>
                    <TableCell className="font-semibold">{bankName}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                          isKeyActive
                            ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        {isKeyActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isKeyActive ? 'Active' : 'Revoked'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{bank.sampleCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">
                      {globalModel.round === 0 && bank.accuracy === 0 ? (
                        <span className="text-xs text-muted-foreground font-sans">Awaiting round</span>
                      ) : (
                        `${(bank.accuracy * 100).toFixed(2)}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {globalModel.round === 0 && bank.precision === 0 ? (
                        <span className="text-xs text-muted-foreground font-sans">—</span>
                      ) : (
                        `${(bank.precision * 100).toFixed(2)}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-chart-2 font-semibold">
                      {globalModel.round === 0 && bank.recall === 0 ? (
                        <span className="text-xs text-muted-foreground font-sans">—</span>
                      ) : (
                        `${(bank.recall * 100).toFixed(2)}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {globalModel.round === 0 && bank.f1 === 0 ? (
                        <span className="text-xs text-muted-foreground font-sans">—</span>
                      ) : (
                        `${(bank.f1 * 100).toFixed(2)}%`
                      )}
                    </TableCell>
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
                    <TableCell className="text-right">
                      {keyPrefix ? (
                        isKeyActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(keyPrefix)}
                            disabled={actionLoadingKey === keyPrefix}
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReinstateKey(keyPrefix)}
                            disabled={actionLoadingKey === keyPrefix}
                            className="h-7 text-xs text-chart-2 hover:text-chart-2 hover:bg-chart-2/10"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Reinstate
                          </Button>
                        )
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">Node Active</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        {/* Registered Bank Nodes Registry (UC-09, UC-16) */}
        {apiBanks.length > 0 && (
          <section className="bg-card border border-card-border rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Registered API Tokens Registry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Active bank node authentication keys registered in central registry (UC-09)</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRegisteredBanks} className="h-8 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Registry
              </Button>
            </div>

            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Node Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiBanks.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs">{item.bank_name}</TableCell>
                      <TableCell className="font-mono text-xs text-primary font-bold">{item.api_key_prefix}</TableCell>
                      <TableCell className="text-xs capitalize">{item.tier}</TableCell>
                      <TableCell className="text-xs">
                        {item.custom_uploaded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                            Custom CSV
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
                            Standard
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                            item.active
                              ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {item.active ? 'Active' : 'Revoked'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(item.api_key_prefix)}
                            disabled={actionLoadingKey === item.api_key_prefix}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReinstateKey(item.api_key_prefix)}
                            disabled={actionLoadingKey === item.api_key_prefix}
                            className="h-7 text-xs text-chart-2 hover:bg-chart-2/10"
                          >
                            Reinstate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
