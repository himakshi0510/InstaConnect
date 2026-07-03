// client/src/app/login/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ 
        email: email.trim().toLowerCase(), 
        password: password 
      });
      router.replace('/');
    } catch (err) {
      console.error("Login component catch error:", err);
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.msg).join(', '));
      } else {
        setError(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[420px] w-full space-y-8 bg-card/80 backdrop-blur-xl p-10 border border-border-subtle rounded-[24px] shadow-2xl relative z-10">
        
        <div className="text-center">
          <h2 className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-aurora tracking-tight mb-2">
            InstaConnect
          </h2>
          <p className="text-[14px] text-text-secondary">
            Sign in to check your personal feed and updates
          </p>
        </div>

        {error && (
          <div className="bg-accent-like/10 border border-accent-like/20 text-accent-like p-4 rounded-[12px] text-[13px] text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password-field" className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password-field"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 mt-2 bg-gradient-primary text-white rounded-[12px] text-[15px] font-bold disabled:opacity-50 hover:opacity-90 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all"
          >
            {submitting ? "Verifying..." : "Log In"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[13px] text-text-secondary">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-accent-cyan hover:text-white transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}