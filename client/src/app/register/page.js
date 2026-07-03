// client/src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await authService.register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/');
    } catch (err) {
      console.error("Registration full error detail:", err);
      
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.msg).join(', '));
      } else if (typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError(
  'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.'
);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-purple/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[420px] w-full space-y-8 bg-card/80 backdrop-blur-xl p-10 border border-border-subtle rounded-[24px] shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-aurora tracking-tight mb-2">InstaConnect</h2>
          <p className="text-[14px] text-text-secondary">Create an account to join the platform</p>
        </div>

        {error && (
          <div className="bg-accent-like/10 border border-accent-like/20 text-accent-like p-4 rounded-[12px] text-[13px] font-medium text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Full Name</label>
            <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-text-muted" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Username</label>
            <input name="username" type="text" required value={formData.username} onChange={handleChange} className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-text-muted" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Email Address</label>
            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-text-muted" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Password</label>
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full px-4 py-3.5 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-text-muted pr-12" 
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

          <p className="mt-2 ml-1 text-[11px] text-text-muted leading-5">
  Password must contain:
  <br />
  • Minimum 8 characters
  <br />
  • One uppercase letter (A-Z)
  <br />
  • One lowercase letter (a-z)
  <br />
  • One number (0-9)
  <br />
  • One special character (!@#$%^&*)
</p>

          <button type="submit" disabled={submitting} className="w-full py-3.5 mt-2 bg-gradient-primary text-white rounded-[12px] text-[15px] font-bold disabled:opacity-50 hover:opacity-90 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all">
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[13px] text-text-secondary">
            Already have an account? <Link href="/login" className="font-semibold text-accent-purple hover:text-white transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}