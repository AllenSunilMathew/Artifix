import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', registrationToken: '' });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.registrationToken || undefined);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const routes = {
        patient: '/patient',
        doctor: '/doctor',
        admin: '/admin',
        lab_technician: '/lab_technician',
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.requiresToken) setShowToken(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(14,165,233,0.06) 0%, transparent 60%), #020617',
      }}
    >
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
            >
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr2YYpM67jmaLBNGWvGlbgMP0AF0rPdzxZsg&s" alt="" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your Artfix account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Registration token for staff */}
            {showToken && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}
              >
                <p className="text-yellow-400 text-sm font-semibold">⚠ Registration Token Required</p>
                <p className="text-slate-400 text-xs">
                  First-time login as staff requires the token provided by your admin.
                </p>
                <input
                  name="registrationToken"
                  className="input text-sm"
                  placeholder="e.g. AB12CD34"
                  value={form.registrationToken}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, registrationToken: e.target.value.toUpperCase() }))
                  }
                  autoComplete="off"
                />
              </div>
            )}

            {!showToken && (
              <button
                type="button"
                onClick={() => setShowToken(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Doctor / Lab Technician? Enter registration token →
              </button>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner"></div> Signing in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            New patient?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold">
              Create an account
            </Link>
          </p>

        
        </div>
      </div>
    </div>
  );
}
