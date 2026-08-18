import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Google icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"/>
  </svg>
);

// Glass-style input wrapper — adapted to Vaultic border + focus tokens
const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-all focus-within:border-blue-500/60 focus-within:bg-blue-500/5"
    style={{ marginTop: '0.5rem' }}
  >
    {children}
  </div>
);

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  loading?: boolean;
  errorMessage?: string;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, letterSpacing: '-0.03em' }}>
      Welcome back
    </span>
  ),
  description = 'Enter your credentials and Vaultic API Key to access your role dashboard.',
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  loading = false,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div
      className="min-h-[100dvh] flex flex-col md:flex-row w-full"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── LEFT: Sign-in form ── */}
      <section className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
                style={{ backgroundColor: '#2563eb' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#101828', letterSpacing: '-0.02em' }}>
                Vaultic
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.03em', color: '#101828', lineHeight: 1.05 }}
            >
              {title}
            </h1>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={onSignIn}>
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</label>
                <GlassInputWrapper>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="operator@vaultic.io"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground/60"
                    required
                    autoComplete="email"
                  />
                </GlassInputWrapper>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="signin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground/60"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword
                        ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                        : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      }
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {/* API Key — Vaultic-specific field */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: '#2563eb' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>
                  Vaultic API Key <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">(required every login)</span>
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="signin-apikey"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="demo-key-12345 or vlt_..."
                      className="w-full bg-transparent font-mono text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground/60"
                      required
                      data-testid="input-api-key"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showApiKey
                        ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                        : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      }
                    </button>
                  </div>
                </GlassInputWrapper>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">demo-key-12345</code> for Operator access, or a registered bank key for Bank Node access.
                </p>
              </div>

              {/* Remember me + Reset password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="w-4 h-4 rounded border-border accent-blue-600"
                  />
                  <span className="text-foreground/80 text-xs">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#2563eb' }}
                >
                  Reset password
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl py-4 font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}
                data-testid="button-submit-auth"
              >
                {loading ? 'Authenticating…' : 'Sign In to Vaultic'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-border" />
              <span className="px-4 text-xs text-muted-foreground bg-background absolute whitespace-nowrap">
                Or continue with
              </span>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-3.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Create account */}
            <p className="text-center text-xs text-muted-foreground">
              New to Vaultic?{' '}
              <button
                type="button"
                onClick={onCreateAccount}
                className="font-semibold transition-colors hover:underline"
                style={{ color: '#2563eb' }}
              >
                Request Access
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Hero image panel ── */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 overflow-hidden">
          <div
            className="absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImageSrc})`,
              background: `linear-gradient(180deg, #2962ff 0%, #2962ff 30%, #4d87ff 50%, #b8d4ff 68%, #deeaff 80%, #f0f4ff 90%, #ffffff 100%)`,
            }}
          >
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center px-10 text-center">
              <img
                src={heroImageSrc}
                alt="Vaultic Federated Network"
                className="w-full max-w-md object-contain drop-shadow-2xl"
                style={{ mixBlendMode: 'lighten' }}
              />
              <h2
                className="mt-6 text-3xl xl:text-4xl leading-tight max-w-sm"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.03em', color: '#101828' }}
              >
                Fraud Intelligence Without Sharing Raw Data
              </h2>
              <p className="mt-3 text-sm text-center max-w-xs leading-relaxed" style={{ color: 'rgba(16,24,40,0.65)' }}>
                Collaboratively train fraud detection models while keeping sensitive transaction data within each institution.
              </p>

              {/* Testimonials */}
              {testimonials.length > 0 && (
                <div className="mt-8 flex gap-4 flex-wrap justify-center">
                  {testimonials.slice(0, 2).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/30 p-4 w-60 text-left shadow"
                    >
                      <img src={t.avatarSrc} className="h-9 w-9 object-cover rounded-xl shrink-0" alt={t.name} />
                      <div className="text-xs leading-snug">
                        <p className="font-semibold text-ink">{t.name}</p>
                        <p className="text-muted-foreground">{t.handle}</p>
                        <p className="mt-1 text-foreground/80">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export { SignInPage as default };
