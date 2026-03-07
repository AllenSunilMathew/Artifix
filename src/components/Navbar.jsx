import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardPath = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin',
    lab_technician: '/lab_technician',
  };

  const roleColors = {
    patient: '#38bdf8',
    doctor: '#10b981',
    admin: '#f59e0b',
    lab_technician: '#a78bfa',
  };

  const roleLabels = {
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
    lab_technician: 'Lab Tech',
  };

  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(2,6,23,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}
            >
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuxWSzeRbGMPyss8iN0orGPS1WKHHCNOao53djyhQfGw&s" alt="" />
            </div>
            <div>
              <span className="font-display font-bold text-lg gradient-text">Artifix</span>
              <span className="text-slate-400 font-bold text-lg">+</span>
            </div>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Home</Link>
              </>
            )}
            {user && (
              <Link
                to={dashboardPath[user.role] || '/'}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'patient' && (
              <>
                <Link to="/book-appointment" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Book Appointment</Link>
                <Link to="/book-lab-test" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Book Lab Test</Link>
              </>
            )}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hidden sm:flex">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}
                  >
                    {user.profilePicture ? (
                      <img src={`${API}${user.profilePicture}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-white leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-xs mt-0.5" style={{ color: roleColors[user.role] }}>
                      {roleLabels[user.role]}
                    </p>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden shadow-2xl animate-fade-in"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50 }}
                  >
                    <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={dashboardPath[user.role] || '/'}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <span className="text-base"></span> View Profile
                      </Link>
                      {user.role === 'patient' && (
                        <>
                          <Link to="/book-appointment" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                            <span className="text-base"></span> Book Appointment
                          </Link>
                          <Link to="/book-lab-test" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                            <span className="text-base"></span> Book Lab Test
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t py-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <span className="text-base"></span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
