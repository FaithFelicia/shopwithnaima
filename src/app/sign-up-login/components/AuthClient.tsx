'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

type AuthTab = 'login' | 'register';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function AuthClient() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Login state
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '', remember: false });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginForm & { general: string }>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState<RegisterForm>({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [regErrors, setRegErrors] = useState<Partial<RegisterForm & { general: string }>>({});
  const [showRegPassword, setShowRegPassword] = useState(false);

  const updateLogin = (field: keyof LoginForm, value: string | boolean) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (loginErrors[field as keyof typeof loginErrors]) {
      setLoginErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updateReg = (field: keyof RegisterForm, value: string) => {
    setRegForm((prev) => ({ ...prev, [field]: value }));
    if (regErrors[field as keyof typeof regErrors]) {
      setRegErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<typeof loginErrors> = {};
    if (!loginForm.email.trim() || !/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Valid email required';
    if (!loginForm.password || loginForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (Object.keys(errors).length > 0) { setLoginErrors(errors); return; }

    setLoading(true);
    try {
      await signIn(loginForm.email, loginForm.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      setLoginErrors({ general: err?.message || 'Invalid email or password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<typeof regErrors> = {};
    if (!regForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!regForm.email.trim() || !/\S+@\S+\.\S+/.test(regForm.email)) errors.email = 'Valid email required';
    if (regForm.phone && !/^(\+254|0)[17]\d{8}$/.test(regForm.phone.replace(/\s/g, '')))
      errors.phone = 'Enter a valid Kenyan phone number';
    if (!regForm.password || regForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (regForm.password !== regForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setRegErrors(errors); return; }

    setLoading(true);
    try {
      const data = await signUp(regForm.email, regForm.password, { fullName: regForm.fullName });
      // Check if email confirmation is required (user exists but session is null)
      if (data?.user && !data?.session) {
        setSuccess('Account created! Please check your email to confirm your account, then sign in.');
      } else if (data?.user && data?.session) {
        setSuccess('Account created! Welcome to Shop With Naima!');
        setTimeout(() => router.push('/'), 1500);
      } else {
        setRegErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already registered')) {
        setRegErrors({ general: 'An account with this email already exists. Please sign in instead.' });
      } else {
        setRegErrors({ general: msg || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Fashion Image */}
      <div className="hidden lg:block relative bg-primary">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1f2c2fa80-1775199821686.png"
          alt="Fashion editorial, dark moody atmospheric studio, model in premium clothing, deep shadows, black walls, dramatic lighting"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-70" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-12 right-12">
          <div className="flex items-center gap-3 mb-6">
            <AppLogo size={32} />
            <span className="font-display text-lg font-semibold tracking-wider uppercase text-white">
              Shop With Naima
            </span>
          </div>
          <p className="text-2xl font-display font-light text-white/80 leading-snug">
            &ldquo;Fashion is the armor to survive the reality of everyday life.&rdquo;
          </p>
          <p className="text-sm text-white/40 mt-3">— Bill Cunningham</p>
        </div>
      </div>

      {/* Right: Auth Forms */}
      <div className="flex flex-col items-center justify-center px-6 py-16 sm:py-20 pt-24 lg:pt-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <AppLogo size={28} />
            <span className="font-display text-base font-semibold tracking-wider uppercase">Shop With Naima</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-8">
            <button
              onClick={() => { setTab('login'); setSuccess(''); }}
              className={`tab-btn flex-1 text-center ${tab === 'login' ? 'active' : ''}`}>
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setSuccess(''); }}
              className={`tab-btn flex-1 text-center ${tab === 'register' ? 'active' : ''}`}>
              Create Account
            </button>
          </div>

          {success &&
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 mb-6">
              <Icon name="CheckCircleIcon" size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          }

          {/* Login Form */}
          {tab === 'login' &&
            <form onSubmit={handleLogin} className="space-y-4">
              {loginErrors.general &&
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3">
                  <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{loginErrors.general}</p>
                </div>
              }
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => updateLogin('email', e.target.value)}
                  placeholder="you@email.com"
                  className={`input-field ${loginErrors.email ? 'border-red-400' : ''}`}
                  autoComplete="email" />
                {loginErrors.email && <p className="text-xs text-red-500 mt-1">{loginErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => updateLogin('password', e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pr-10 ${loginErrors.password ? 'border-red-400' : ''}`}
                    autoComplete="current-password" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Icon name={showLoginPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                  </button>
                </div>
                {loginErrors.password && <p className="text-xs text-red-500 mt-1">{loginErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => updateLogin('remember', e.target.checked)}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-xs text-accent hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-accent hover:underline font-medium">
                  Create one
                </button>
              </p>
            </form>
          }

          {/* Register Form */}
          {tab === 'register' &&
            <form onSubmit={handleRegister} className="space-y-4">
              {regErrors.general &&
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3">
                  <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{regErrors.general}</p>
                </div>
              }
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regForm.fullName}
                  onChange={(e) => updateReg('fullName', e.target.value)}
                  placeholder="e.g. Amina Wanjiru"
                  className={`input-field ${regErrors.fullName ? 'border-red-400' : ''}`}
                  autoComplete="name" />
                {regErrors.fullName && <p className="text-xs text-red-500 mt-1">{regErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => updateReg('email', e.target.value)}
                  placeholder="you@email.com"
                  className={`input-field ${regErrors.email ? 'border-red-400' : ''}`}
                  autoComplete="email" />
                {regErrors.email && <p className="text-xs text-red-500 mt-1">{regErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) => updateReg('phone', e.target.value)}
                  placeholder="0712 345 678"
                  className={`input-field ${regErrors.phone ? 'border-red-400' : ''}`}
                  autoComplete="tel" />
                {regErrors.phone && <p className="text-xs text-red-500 mt-1">{regErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regForm.password}
                    onChange={(e) => updateReg('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`input-field pr-10 ${regErrors.password ? 'border-red-400' : ''}`}
                    autoComplete="new-password" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Icon name={showRegPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                  </button>
                </div>
                {regErrors.password && <p className="text-xs text-red-500 mt-1">{regErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regForm.confirmPassword}
                  onChange={(e) => updateReg('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ${regErrors.confirmPassword ? 'border-red-400' : ''}`}
                  autoComplete="new-password" />
                {regErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{regErrors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : 'Create Account'}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-accent hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          }
        </div>
      </div>
    </div>
  );
}
