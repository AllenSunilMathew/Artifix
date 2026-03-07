import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function LabTechDashboard() {
  const { user, updateUser } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [resultModal, setResultModal] = useState(null);
  const [resultForm, setResultForm] = useState({ notes: '', parameters: [] });
  const [newParam, setNewParam] = useState({ name: '', value: '', unit: '', normalRange: '', status: '' });
  const fileInputRef = useRef();

  useEffect(() => {
    axios.get('/api/lab-tests/all')
      .then((r) => setTests(r.data))
      .catch(() => toast.error('Failed to load tests'))
      .finally(() => setLoading(false));
  }, []);

  const openResult = (test) => {
    setResultModal(test);
    setResultForm({ notes: '', parameters: [] });
    setNewParam({ name: '', value: '', unit: '', normalRange: '', status: '' });
  };

  const addParam = () => {
    if (!newParam.name || !newParam.value) { toast.error('Parameter name and value required'); return; }
    setResultForm((p) => ({ ...p, parameters: [...p.parameters, { ...newParam }] }));
    setNewParam({ name: '', value: '', unit: '', normalRange: '', status: '' });
  };

  const removeParam = (i) => setResultForm((p) => ({ ...p, parameters: p.parameters.filter((_, idx) => idx !== i) }));

  const submitResult = async () => {
    if (!resultForm.notes.trim() && resultForm.parameters.length === 0) {
      toast.error('Please add notes or at least one parameter');
      return;
    }
    try {
      const res = await axios.patch(`/api/lab-tests/${resultModal._id}/result`, resultForm);
      setTests((p) => p.map((t) => t._id === resultModal._id ? res.data : t));
      toast.success('Results uploaded successfully!');
      setResultModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload');
    }
  };

  const markPaid = async (id) => {
    try {
      await axios.patch(`/api/lab-tests/${id}/pay`);
      setTests((p) => p.map((t) => t._id === id ? { ...t, paymentStatus: 'paid' } : t));
      toast.success('Payment marked');
    } catch { toast.error('Failed'); }
  };

  const handleProfilePic = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('profilePicture', file);
    try {
      const r = await axios.post('/api/users/upload-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ profilePicture: r.data.profilePicture });
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTests = tests.filter((t) => new Date(t.scheduledDate).toISOString().split('T')[0] === todayStr);
  const filtered = filterStatus === 'all' ? tests : tests.filter((t) => t.status === filterStatus);

  const FILTER_TABS = ['all', 'scheduled', 'completed', 'expired', 'cancelled'];

  if (loading) return <div className="page flex items-center justify-center min-h-[60vh]"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            {user?.profilePicture ? <img src={`${API}${user.profilePicture}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]}</div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10b981', border: '2px solid #020617' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleProfilePic} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
          <p className="text-emerald-400 font-semibold">Lab Technician</p>
          <p className="text-slate-400 text-sm">{user?.department} • {user?.labSection}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Tests", value: todayTests.length, icon: '🔬', color: '#10b981' },
          { label: 'Total Tests', value: tests.length, icon: '', color: '#0ea5e9' },
          { label: 'Completed', value: tests.filter((t) => t.status === 'completed').length, icon: '', color: '#8b5cf6' },
          { label: 'Pending', value: tests.filter((t) => t.status === 'scheduled').length, icon: '', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between mb-3"><span className="text-xl">{s.icon}</span><div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="tab-bar mb-6">
        {FILTER_TABS.map((f) => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`tab-btn tab-btn-green capitalize ${filterStatus === f ? 'active' : ''}`}>{f}</button>
        ))}
      </div>

      {/* Test list */}
      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t._id} className="glass-card p-5 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>🔬</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">{t.subCategory}</p>
                <p className="text-emerald-400 text-sm">{t.testCategory}</p>
                <p className="text-slate-400 text-sm font-semibold mt-0.5">{t.patient?.name}</p>
                <p className="text-slate-500 text-xs">{t.patient?.phone} • {t.patient?.email}</p>
                <p className="text-slate-500 text-xs">{new Date(t.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {t.scheduledTime} • Token: {t.tokenNumber}</p>
                <p className="text-yellow-400 text-xs font-semibold">Amount: ₹{t.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-shrink-0 sm:flex-col sm:items-end sm:justify-center">
              <span className={`badge ${t.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{t.paymentStatus}</span>
              <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'expired' ? 'badge-red' : t.status === 'scheduled' ? 'badge-blue' : 'badge-gray'}`}>{t.status}</span>
              {t.status === 'scheduled' && (
                <div className="flex gap-2">
                  {t.paymentStatus === 'pending' && (
                    <button onClick={() => markPaid(t._id)} className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>Mark Paid</button>
                  )}
                  <button onClick={() => openResult(t)} className="btn btn-success btn-sm">Upload Results</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card p-16 text-center"><p className="text-5xl mb-4"></p><p className="text-white font-bold text-lg">No tests found</p></div>
        )}
      </div>

      {/* Result Modal */}
      {resultModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">Upload Test Results</h3>
                <p className="text-slate-400 text-sm">{resultModal.subCategory} — {resultModal.patient?.name} — Token {resultModal.tokenNumber}</p>
              </div>
              <button onClick={() => setResultModal(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="space-y-5">
              <div className="form-group">
                <label className="form-label">Results Summary / Notes *</label>
                <textarea className="input" rows={4} placeholder="Enter findings, observations, and summary of results..." value={resultForm.notes} onChange={(e) => setResultForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>

              {/* Parameters */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label">Test Parameters</label>
                  <span className="text-xs text-slate-500">{resultForm.parameters.length} added</span>
                </div>

                {/* Existing parameters */}
                {resultForm.parameters.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {resultForm.parameters.map((param, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${param.status === 'high' ? 'badge-red' : param.status === 'low' ? 'badge-yellow' : 'badge-green'}`}>{param.status || 'normal'}</span>
                          <span className="text-white font-medium">{param.name}</span>
                          <span className="text-slate-400">{param.value} {param.unit}</span>
                          {param.normalRange && <span className="text-slate-500 text-xs">({param.normalRange})</span>}
                        </div>
                        <button onClick={() => removeParam(i)} className="text-slate-500 hover:text-red-400 text-xs ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add parameter */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-slate-500 font-semibold mb-3">ADD PARAMETER</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input className="input text-sm" placeholder="Parameter name (e.g. Haemoglobin)" value={newParam.name} onChange={(e) => setNewParam((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input text-sm" placeholder="Value (e.g. 14.2)" value={newParam.value} onChange={(e) => setNewParam((p) => ({ ...p, value: e.target.value }))} />
                    <input className="input text-sm" placeholder="Unit (e.g. g/dL)" value={newParam.unit} onChange={(e) => setNewParam((p) => ({ ...p, unit: e.target.value }))} />
                    <input className="input text-sm" placeholder="Normal range (e.g. 12-17)" value={newParam.normalRange} onChange={(e) => setNewParam((p) => ({ ...p, normalRange: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <select className="input text-sm flex-1" value={newParam.status} onChange={(e) => setNewParam((p) => ({ ...p, status: e.target.value }))} style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <option value="">Normal</option>
                      <option value="high">High ↑</option>
                      <option value="low">Low ↓</option>
                    </select>
                    <button onClick={addParam} className="btn btn-primary btn-sm flex-shrink-0">+ Add</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setResultModal(null)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={submitResult} className="btn btn-success flex-1 py-3">Submit Results</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
