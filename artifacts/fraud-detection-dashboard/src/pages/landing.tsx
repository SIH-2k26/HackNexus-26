import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/landing/Reveal';
import { LogoMark } from '@/components/landing/Logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Key, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import heroVisual from '@/assets/hero-federated.png';
import solutionVisual from '@/assets/solution-visual.png';

const pipeline = [
  "Local Data",
  "Local Training",
  "Differential Privacy",
  "Secure Aggregation",
  "FedAvg",
  "Global Model",
  "Fraud Detection",
];

const privacyFlow = [
  "Bank Data",
  "Local Training",
  "Protected Model Update",
  "Federated Aggregation",
  "Global Model",
];

const products = [
  {
    title: "Federated Learning",
    description:
      "Train fraud detection models locally at participating institutions and combine learned model parameters into a shared global model.",
    highlights: [
      "Raw transaction data remains local",
      "Local MLP training",
      "Collaborative model improvement",
      "Multi-round federated learning",
    ],
  },
  {
    title: "Privacy Protection",
    description:
      "Protect model updates before federation using privacy-preserving mechanisms designed to reduce exposure of sensitive information.",
    highlights: [
      "Differential Privacy",
      "Controlled noise addition",
      "Secure aggregation masking",
      "No raw transaction exchange",
    ],
  },
  {
    title: "Fraud Intelligence",
    description:
      "Use the collaboratively trained global model to evaluate transactions and identify potentially fraudulent activity.",
    highlights: [
      "Risk scoring",
      "Fraud probability",
      "Low / Medium / High risk",
      "Allow / Review / Flag decisions",
    ],
  },
];

const operatorFeatures = [
  "Command Center",
  "Bank Network",
  "Global Model",
  "Audit",
  "Fraud Checker",
  "System Configuration",
];

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return (
    <span aria-hidden className="text-muted-foreground/60">
      {vertical ? "\u2193" : "\u2192"}
    </span>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Supabase User Authentication (or demo bypass if offline)
      let user = null;
      if (email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If user doesn't exist, attempt signUp or fallback gracefully
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError && !signUpError.message.includes('already registered')) {
            console.warn('Supabase auth notice:', signUpError.message);
          } else {
            user = signUpData?.user || { email };
          }
        } else {
          user = data.user;
        }
      }

      // 2. Validate Vaultic API key via backend
      const res = await fetch('http://127.0.0.1:8000/auth/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Invalid API Key' }));
        setErrorMessage(errData.detail || 'Authentication failed. Please verify your Vaultic API key.');
        setLoading(false);
        return;
      }

      const keyData = await res.json();

      // 3. Store verified Vaultic session in localStorage
      const sessionData = {
        authenticated: true,
        role: keyData.role,
        bank_name: keyData.bank_name,
        bank_id: keyData.bank_id,
        tier: keyData.tier,
        apiKey: apiKey,
        userEmail: email || 'authenticated_user',
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('vaultic_auth_session', JSON.stringify(sessionData));

      // 4. Role-based Redirect Logic
      if (keyData.role === 'operator') {
        setLocation('/');
      } else {
        setLocation('/banks');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage('Network or server error during key verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="top" className="overflow-x-hidden min-h-screen bg-background text-foreground">
      <Nav onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Section */}
      <section className="hero-panel text-on-brand pt-32 pb-20 px-5">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" /> Collaborative Fraud Detection Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Vaultic — Fraud Intelligence Without Sharing Raw Data
          </h1>
          <p className="text-lg sm:text-xl text-on-brand-muted max-w-2xl mx-auto mb-10">
            Vaultic lets financial institutions collaboratively train fraud detection models with federated learning, keeping raw transaction data inside each bank.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={() => setAuthModalOpen(true)}
              className="bg-card text-foreground hover:bg-card/90 font-semibold px-8 h-12 rounded-full text-base shadow-lg"
              data-testid="button-landing-get-started"
            >
              Access Vaultic Console <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/30 text-on-brand font-medium text-base hover:bg-white/10 transition-colors"
            >
              Learn How It Works
            </a>
          </div>

          <div className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img src={heroVisual} alt="Vaultic Architecture Visual" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="platform" className="py-24 px-5 bg-card">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow mb-3">Platform Capabilities</span>
              <h2 className="text-3xl font-bold tracking-tight">Privacy-First Collaborative AI</h2>
              <p className="text-muted-foreground mt-3">
                Built specifically for multi-bank fraud prevention networks with zero raw data transfer.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p, idx) => (
              <Reveal key={idx} delay={idx * 150}>
                <div className="soft-card p-8 h-full flex flex-col justify-between hover:border-primary/50 transition-colors">
                  <div>
                    <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{p.description}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {p.highlights.map((h, i) => (
                      <li key={i} className="flex items-center text-xs font-semibold text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-chart-2 mr-2 shrink-0" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Section */}
      <section id="how-it-works" className="py-24 px-5 bg-surface">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow mb-3">Federated Workflow</span>
              <h2 className="text-3xl font-bold tracking-tight">End-to-End Pipeline</h2>
            </div>
          </Reveal>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {pipeline.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="flow-chip font-mono text-xs">{item}</span>
                {idx < pipeline.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Solution Section */}
      <section id="architecture" className="py-24 px-5 bg-card">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="space-y-6">
                <span className="eyebrow">Enterprise Security</span>
                <h2 className="text-3xl font-bold tracking-tight">Differential Privacy & Secure Aggregation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vaultic injects Gaussian Differential Privacy noise into local weight matrices before transmission and applies pairwise zero-sum masks during central aggregation.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <p className="text-xs font-mono font-bold text-primary">Differential Privacy (ε=1.0)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Gaussian Noise σ = 0.01 / ε protects individual transaction privacy.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <p className="text-xs font-mono font-bold text-chart-2">Secure Aggregation (δ &lt; 10⁻⁹)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pairwise mask cancellation prevents central node from inspecting local bank updates.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-3xl overflow-hidden shadow-xl border border-border">
                <img src={solutionVisual} alt="Privacy Visual" className="w-full h-auto object-cover" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />

      {/* AUTH & API KEY VERIFICATION DIALOG */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-6 h-6 text-primary" /> Access Vaultic Console
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Enter your credentials and Vaultic API Key to authenticate and access your role dashboard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs font-semibold">User Email (Supabase Auth)</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="operator@vaultic.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs font-semibold">Password</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label htmlFor="auth-apikey" className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-primary" /> Vaultic API Key (Required Every Login)
              </Label>
              <Input
                id="auth-apikey"
                type="password"
                placeholder="Enter demo-key-12345 or vlt_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="bg-background font-mono text-xs"
                required
                data-testid="input-api-key"
              />
              <p className="text-[10px] text-muted-foreground">
                Enter <code className="bg-muted px-1 py-0.5 rounded font-mono">demo-key-12345</code> for Operator Admin access, or a registered bank key for Bank Node access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setAuthModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading || !apiKey} data-testid="button-submit-auth">
                {loading ? 'Authenticating...' : 'Sign In & Access Dashboard'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
