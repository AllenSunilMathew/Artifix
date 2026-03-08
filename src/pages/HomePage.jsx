import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '500+', label: 'Patients Served', icon: '' },
  { value: '25+', label: 'Specialist Doctors', icon: '' },
  { value: '30+', label: 'Lab Tests', icon: '' },
  { value: '24/7', label: 'AI Support', icon: '' },
];

const SERVICES = [
  { icon: '', title: 'Doctor Appointments', desc: 'Book with 25+ specialists. Get a unique token instantly.' },
  { icon: '', title: 'Lab Testing', desc: '10 categories, 30+ tests. Results downloadable as PDF.' },
  { icon: '', title: 'Digital Prescriptions', desc: 'Doctors add medicines, injections and follow-up schedules.' },
  { icon: '', title: 'AI Health Assistant', desc: 'Describe symptoms and get instant guidance any time.' },
  { icon: '', title: 'Easy Check-In', desc: 'Contactless arrival. Simply arrive at reception.' },
  { icon: '', title: 'Secure Records', desc: 'All health data encrypted and accessible only to you.' },
];

const HOW = [
  { step: '01', title: 'Create Account', desc: 'Register as a patient in under 2 minutes.' },
  { step: '02', title: 'Book Service', desc: 'Pick a doctor or lab test with your preferred time.' },
  { step: '03', title: 'Get Token', desc: 'Your unique slot is reserved and confirmed instantly.' },
  { step: '04', title: 'Arrive On Time', desc: 'Check in at reception. Late arrivals forfeit their slot.' },
];

export default function HomePage() {
  const { user } = useAuth();
  const dashPath = { patient: '/patient', doctor: '/doctor', admin: '/admin', lab_technician: '/lab_technician' };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 15% 60%, rgba(14,165,233,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(16,185,129,0.07) 0%, transparent 55%), #020617',
        }}
      >
        {/* Floating dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: (i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5) + 'px',
                height: (i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5) + 'px',
                background: i % 2 === 0 ? '#0ea5e9' : '#10b981',
                left: (i * 3.7 + 2) % 100 + '%',
                top: (i * 7.3 + 5) % 100 + '%',
                opacity: 0.15 + (i % 5) * 0.05,
                animation: `pulse ${2 + (i % 4)}s ease-in-out infinite ${(i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.2)',
                  color: '#38bdf8',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                Now Accepting New Patients
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.05] mb-6">
                <span className="text-white">Advanced</span>
                <br />
                <span className="gradient-text">Healthcare</span>
                <br />
                <span className="text-white">For Everyone</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
                Book appointments with specialists, schedule lab tests, access AI health guidance
                and manage all your health records — in one beautifully designed platform.
              </p>

              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      Get Started Free
                    </Link>
                    <Link to="/login" className="btn btn-ghost btn-lg">
                      Sign In →
                    </Link>
                  </>
                ) : (
                  <Link to={dashPath[user.role] || '/'} className="btn btn-primary btn-lg">
                    Go to Dashboard →
                  </Link>
                )}
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="hidden lg:block animate-fade-in">
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 40px 120px rgba(14,165,233,0.08)',
                }}
              >
                {/* Fake top bar */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <span className="ml-3 text-slate-600 text-xs font-mono">Artfix.health/patient</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[{ v: '4', l: 'Visits', c: '#f97316' },
                    { v: '2', l: 'Appointments', c: '#0ea5e9' },
                    { v: '1', l: 'Lab Test', c: '#10b981' },
                    { v: '3', l: 'Prescriptions', c: '#8b5cf6' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-xl font-bold" style={{ color: s.c }}>{s.v}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Appointment rows */}
                {[
                  { name: 'Dr. Arun Kumar', spec: 'Cardiologist', time: '10:30 AM', token: '#001', status: 'Today' },
                  { name: 'Dr. Priya Nair', spec: 'Neurologist', time: '2:00 PM', token: '#002', status: 'Tomorrow' },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl mb-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}
                    >
                      {d.name[4]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{d.name}</p>
                      <p className="text-slate-500 text-xs">{d.spec}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sky-400 text-sm font-semibold">{d.time}</p>
                      <p className="text-slate-600 text-xs">{d.token}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}

                <div
                  className="mt-3 p-2.5 rounded-xl text-center text-xs font-semibold"
                  style={{ background: 'rgba(14,165,233,0.06)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.12)' }}
                >
                  ✓ All appointments confirmed with tokens
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="stat-card text-center"
                style={{ animationDelay: i * 0.1 + 's' }}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-3xl font-display font-bold gradient-text">{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Complete Healthcare Platform
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From booking your first appointment to downloading lab reports — all in one seamless experience.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="glass-card p-6 group cursor-default"
              style={{ animationDelay: i * 0.08 + 's' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.12)' }}
              >
                {s.icon}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-display font-bold text-white">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((h, i) => (
              <div key={i} className="text-center relative">
                {i < HOW.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-6 left-[60%] w-full h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.4), transparent)' }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white' }}
                >
                  {h.step}
                </div>
                <h3 className="text-white font-bold mb-2">{h.title}</h3>
                <p className="text-slate-400 text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="rounded-2xl p-14"
              style={{
                background:
                  'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(16,185,129,0.06) 100%)',
                border: '1px solid rgba(14,165,233,0.15)',
              }}
            >
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                Your Health Journey{' '}
                <span className="gradient-text">Starts Here</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of patients who trust MediCare+ for professional, timely and
                compassionate care.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
