import { useState } from 'react';
import { useLocation } from 'wouter';
import { SignInPage } from '@/components/ui/sign-in';
import { supabase } from '@/lib/supabase';
import heroVisual from '@/assets/hero-federated.png';

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const apiKey = (form.elements.namedItem('apiKey') as HTMLInputElement).value;

    try {
      // 1. Supabase User Authentication
      if (email && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError && !signUpError.message.includes('already registered')) {
            console.warn('Supabase auth notice:', signUpError.message);
          }
        }
      }

      // 2. Validate Vaultic API Key via Backend
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

      // 3. Store verified Vaultic session
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

      // 4. Role-based redirect
      if (keyData.role === 'operator') {
        setLocation('/');
      } else {
        setLocation('/banks');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage('Network or server error. Make sure the Vaultic backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (err) {
      console.warn('Google sign-in not configured:', err);
      setErrorMessage('Google sign-in requires Supabase OAuth configuration.');
    }
  };

  return (
    <SignInPage
      title={
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
          Sign in to{' '}
          <span style={{ color: '#2563eb' }}>Vaultic</span>
        </span>
      }
      description="Enter your credentials and Vaultic API Key to access your role dashboard."
      heroImageSrc={heroVisual}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={() => setLocation('/landing')}
      onCreateAccount={() => setLocation('/landing')}
      loading={loading}
      errorMessage={errorMessage}
    />
  );
}
