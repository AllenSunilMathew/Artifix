import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const tabs = ['Dashboard', 'Appointments', 'Lab Tests', 'Prescriptions', 'Doctors', 'Patients', 'Add Staff'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Dashboard');
  const [data, setData] = useState({ stats: {}, recentAppointments: [], recentLabTests: [] });
  const [appointments, setAppointments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staffForm, setStaffForm] = useState({ name:'', email:'', password:'', phone:'', role:'doctor', specialization:'', experience:'', consultationFee:'', department:'' });
  const [newToken, setNewToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      if (tab === 'Dashboard') { const r = await axios.get('/api/admin/dashboard'); setData(r.data); }
      if (tab === 'Appointments') { const r = await axios.get('/api/admin/appointments'); setAppointments(r.data); }
      if (tab === 'Lab Tests') { const r = await axios.get('/api/admin/lab-tests'); setLabTests(r.data); }
      if (tab === 'Prescriptions') { const r = await axios.get('/api/admin/prescriptions'); setPrescriptions(r.data); }
      if (tab === 'Doctors') { const r = await axios.get('/api/admin/staff'); setStaff(r.data); }
      if (tab === 'Patients') { const r = await axios.get('/api/admin/patients'); setPatients(r.data); }
    } catch {}
  };

  const addStaff = async () => {
    setLoading(true);
    try {
      const r = await axios.post('/api/admin/add-staff', staffForm);
      setNewToken({ token: r.data.registrationToken, name: r.data.user.name, role: r.data.user.role });
      toast.success('Staff member added!');
      setStaffForm({ name:'', email:'', password:'', phone:'', role:'doctor', specialization:'', experience:'', consultationFee:'', department:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    try { await axios.patch(`/api/admin/toggle-user/${id}`); toast.success('Updated'); loadData(); } catch {}
  };

  const s = data.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>👑</div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-yellow-400 text-sm">Full System Control</p>
        </div>
      </div>

      {/* Tabs - scrollable */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={tab === t ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Dashboard' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label:'Total Revenue', value:`₹${s.totalRevenue || 0}`, icon:'💰', color:'#f59e0b' },
              { label:'Patients', value:s.totalPatients || 0, icon:'👥', color:'#0ea5e9' },
              { label:'Doctors', value:s.totalDoctors || 0, icon:'🩺', color:'#10b981' },
              { label:'Lab Techs', value:s.totalLabTechs || 0, icon:'🔬', color:'#8b5cf6' },
              { label:'Appointments', value:s.totalAppointments || 0, icon:'📅', color:'#ec4899' },
              { label:'Lab Tests', value:s.totalLabTests || 0, icon:'🧪', color:'#06b6d4' },
              { label:'Prescriptions', value:s.totalPrescriptions || 0, icon:'💊', color:'#84cc16' },
            ].map((item, i) => (
              <div key={i} className="card p-4">
                <div className="flex justify-between mb-2"><span className="text-xl">{item.icon}</span><div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div></div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-4">Recent Appointments</h3>
              {data.recentAppointments.slice(0, 5).map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex-1"><p className="text-white text-sm">{a.patient?.name}</p><p className="text-slate-400 text-xs">→ Dr. {a.doctor?.name} • {new Date(a.appointmentDate).toLocaleDateString()}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'confirmed' ? 'badge-blue' : a.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{a.status}</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-4">Recent Lab Tests</h3>
              {data.recentLabTests.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex-1"><p className="text-white text-sm">{t.patient?.name}</p><p className="text-slate-400 text-xs">{t.subCategory} • ₹{t.amount}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Appointments' && (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a._id} className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1">
                <p className="text-white font-medium">{a.patient?.name} → Dr. {a.doctor?.name}</p>
                <p className="text-slate-400 text-sm">{a.doctor?.specialization} • {new Date(a.appointmentDate).toLocaleDateString()} at {a.appointmentTime}</p>
                <p className="text-slate-500 text-xs">Token #{a.tokenNumber} • {a.patient?.phone}</p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${a.status === 'confirmed' ? 'badge-blue' : a.status === 'completed' ? 'badge-green' : a.status === 'expired' ? 'badge-red' : 'badge-gray'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Lab Tests' && (
        <div className="space-y-3">
          {labTests.map(t => (
            <div key={t._id} className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1">
                <p className="text-white font-medium">{t.patient?.name} — {t.subCategory}</p>
                <p className="text-slate-400 text-sm">{t.testCategory} • {new Date(t.scheduledDate).toLocaleDateString()} at {t.scheduledTime}</p>
                <p className="text-slate-500 text-xs">Token #{t.tokenNumber} • ₹{t.amount}</p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${t.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{t.paymentStatus}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'completed' ? 'badge-green' : t.status === 'expired' ? 'badge-red' : 'badge-blue'}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Prescriptions' && (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <div key={p._id} className="card p-4">
              <div className="flex justify-between mb-2">
                <div><p className="text-white font-medium">{p.patient?.name}</p><p className="text-slate-400 text-sm">Dr. {p.doctor?.name} • {p.doctor?.specialization}</p></div>
                <p className="text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-sky-300 text-sm">Diagnosis: {p.diagnosis}</p>
              <p className="text-slate-400 text-xs">{p.medicines?.length || 0} medicines • {p.injections?.length || 0} injections</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Doctors' && (
        <div className="space-y-3">
          {staff.filter(s => s.role === 'doctor').map(doc => (
            <div key={doc._id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>{doc.name[0]}</div>
              <div className="flex-1">
                <p className="text-white font-semibold">Dr. {doc.name}</p>
                <p className="text-sky-400 text-sm">{doc.specialization} • {doc.experience} yrs</p>
                <p className="text-slate-400 text-xs">{doc.email} • ₹{doc.consultationFee}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${doc.isActive ? 'badge-green' : 'badge-red'}`}>{doc.isActive ? 'Active' : 'Inactive'}</span>
                <button onClick={() => toggleUser(doc._id)} className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>{doc.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Patients' && (
        <div className="space-y-3">
          {patients.map(p => (
            <div key={p._id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>{p.name[0]}</div>
              <div className="flex-1">
                <p className="text-white font-semibold">{p.name}</p>
                <p className="text-slate-400 text-sm">{p.email} • {p.phone}</p>
                <p className="text-slate-500 text-xs">{p.gender} • {p.bloodGroup} • {p.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                <button onClick={() => toggleUser(p._id)} className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>{p.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Add Staff' && (
        <div className="max-w-2xl">
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-5">Add Doctor or Lab Technician</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Role *</label>
                <div className="flex gap-3">
                  {['doctor', 'lab_technician'].map(r => (
                    <button key={r} onClick={() => setStaffForm({...staffForm, role: r})} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${staffForm.role === r ? 'text-white' : 'text-slate-400'}`}
                      style={staffForm.role === r ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Full Name *</label><input className="input-dark" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} placeholder="Dr. John Doe" /></div>
              <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Email *</label><input type="email" className="input-dark" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} placeholder="doctor@hospital.com" /></div>
              <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Password *</label><input type="password" className="input-dark" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} /></div>
              <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Phone *</label><input className="input-dark" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} /></div>
              {staffForm.role === 'doctor' && (
                <>
                  <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Specialization</label><input className="input-dark" value={staffForm.specialization} onChange={e => setStaffForm({...staffForm, specialization: e.target.value})} placeholder="e.g. Cardiologist" /></div>
                  <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Experience (years)</label><input type="number" className="input-dark" value={staffForm.experience} onChange={e => setStaffForm({...staffForm, experience: e.target.value})} /></div>
                  <div><label className="text-slate-300 text-sm font-medium block mb-1.5">Consultation Fee (₹)</label><input type="number" className="input-dark" value={staffForm.consultationFee} onChange={e => setStaffForm({...staffForm, consultationFee: e.target.value})} /></div>
                </>
              )}
              <div className="col-span-2"><label className="text-slate-300 text-sm font-medium block mb-1.5">Department</label><input className="input-dark" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} placeholder="e.g. Cardiology" /></div>
              <div className="col-span-2">
                <button onClick={addStaff} disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </div>
          </div>

          {newToken && (
            <div className="mt-4 card p-5" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
              <p className="text-emerald-400 font-semibold mb-2">✅ Staff Added Successfully!</p>
              <p className="text-slate-300 text-sm mb-3">Share this registration token with <strong className="text-white">{newToken.name}</strong>. They must use it for their first login:</p>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0f172a' }}>
                <p className="text-2xl font-bold text-emerald-400 font-mono tracking-widest flex-1">{newToken.token}</p>
                <button onClick={() => { navigator.clipboard.writeText(newToken.token); toast.success('Token copied!'); }} className="text-xs px-3 py-1.5 rounded-lg text-emerald-400" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>Copy</button>
              </div>
              <p className="text-slate-500 text-xs mt-2">⚠ Store this token safely. It's required for the staff member's first login.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
