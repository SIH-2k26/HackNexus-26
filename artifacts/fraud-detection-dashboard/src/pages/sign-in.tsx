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

    const allowedOperatorEmails = (
      import.meta.env.VITE_OPERATOR_EMAIL ||
      'operator@vaultic.io,sarthakpatil18@gmail.com,sarthak@vaultic.io'
    )
      .split(',')
      .map((e: string) => e.trim().toLowerCase());

    const normalizedEmail = email.trim().toLowerCase();

    // Check if the user email is registered/authorized
    const isAuthorizedOperator = allowedOperatorEmails.includes(normalizedEmail);

    if (!isAuthorizedOperator && !normalizedEmail.endsWith('@vaultic.io') && !normalizedEmail.includes('admin') && !normalizedEmail.includes('operator')) {
      setErrorMessage('User not registered. This email is not authorized for Vaultic Central Operator access.');
      setLoading(false);
      return;
    }

    try {
      // 1. Supabase User Authentication & Email Storage in Supabase
      if (email && password) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // If user does not exist in Supabase auth yet, automatically create and store their account
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                registered_at: new Date().toISOString(),
                platform: 'Vaultic Federated Fraud Intelligence',
                authorized_operator: isAuthorizedOperator,
              },
            },
          });
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
      setErrorMessage('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/sign-in`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      setErrorMessage(err?.message || 'Google sign-in requires Supabase OAuth configuration.');
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
