import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    gender: '', bloodGroup: '', dateOfBirth: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Artfix');
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.06) 0%, transparent 60%), #020617',
      }}
    >
      <div className="w-full max-w-xl">
        <div className="glass-card p-8 rounded-2xl animate-slide-up">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Create Patient Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join Artfix — completely free</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2 form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" className="input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input name="email" type="email" className="input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input name="phone" className="input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="sm:col-span-2 form-group">
                <label className="form-label">Password * (min 6 characters)</label>
                <input name="password" type="password" className="input" placeholder="Create a strong password" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="input" value={form.gender} onChange={handleChange} style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" className="input" value={form.bloodGroup} onChange={handleChange} style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input name="dateOfBirth" type="date" className="input" value={form.dateOfBirth} onChange={handleChange} style={{ colorScheme: 'dark' }} />
              </div>
              <div className="form-group">
                <label className="form-label">City / Address</label>
                <input name="address" className="input" placeholder="Mumbai, Maharashtra" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-success w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner"></div> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">               Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
