import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const map = { confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red', expired:'badge-gray', pending:'badge-yellow' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace('_',' ')}</span>;
};

export default function DoctorDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescModal, setPrescModal] = useState(null);
  const [prescForm, setPrescForm] = useState({ diagnosis:'', medicines:[{name:'',dosage:'',frequency:'',duration:'',instructions:''}], injections:[], nextCheckupDate:'', dietaryAdvice:'', notes:'' });
  const fileInputRef = useRef();

  useEffect(() => {
    Promise.all([
      axios.get('/api/appointments/doctor/mine').then((r) => setAppointments(r.data)),
      axios.get('/api/prescriptions/doctor/mine').then((r) => setPrescriptions(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const openPrescModal = (appt) => {
    setPrescModal(appt);
    setPrescForm({ diagnosis:'', medicines:[{name:'',dosage:'',frequency:'',duration:'',instructions:''}], injections:[], nextCheckupDate:'', dietaryAdvice:'', notes:'' });
  };

  const updateMed = (i, field, val) => setPrescForm((p) => { const m=[...p.medicines]; m[i]={...m[i],[field]:val}; return {...p,medicines:m}; });
  const addMed = () => setPrescForm((p) => ({...p, medicines:[...p.medicines,{name:'',dosage:'',frequency:'',duration:'',instructions:''}]}));
  const removeMed = (i) => setPrescForm((p) => ({...p, medicines:p.medicines.filter((_,idx)=>idx!==i)}));
  const updateInj = (i, field, val) => setPrescForm((p) => { const inj=[...p.injections]; inj[i]={...inj[i],[field]:val}; return {...p,injections:inj}; });
  const addInj = () => setPrescForm((p) => ({...p, injections:[...p.injections,{name:'',dosage:'',schedule:''}]}));
  const removeInj = (i) => setPrescForm((p) => ({...p, injections:p.injections.filter((_,idx)=>idx!==i)}));

  const submitPrescription = async () => {
    if (!prescForm.diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    try {
      const res = await axios.post('/api/prescriptions', {
        patientId: prescModal.patient._id,
        appointmentId: prescModal._id,
        ...prescForm,
      });
      setPrescriptions((p) => [res.data, ...p]);
      toast.success('Prescription saved successfully!');
      setPrescModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleProfilePic = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    const fd = new FormData(); fd.append('profilePicture', file);
    try {
      const r = await axios.post('/api/users/upload-picture', fd, {headers:{'Content-Type':'multipart/form-data'}});
      updateUser({profilePicture: r.data.profilePicture});
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => new Date(a.appointmentDate).toISOString().split('T')[0] === today);
  const upcoming = appointments.filter((a) => a.status === 'confirmed' && new Date(a.appointmentDate) >= new Date());

  const TABS = [
    { id: 'appointments', label: '📅 Appointments' },
    { id: 'prescriptions', label: '💊 Prescriptions' },
    { id: 'profile', label: '👤 Profile' },
  ];

  if (loading) return <div className="page flex items-center justify-center min-h-[60vh]"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden" style={{background:'linear-gradient(135deg,#0ea5e9,#10b981)'}}>
            {user?.profilePicture ? <img src={`${API}${user.profilePicture}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]}</div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#0ea5e9',border:'2px solid #020617'}}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleProfilePic} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dr. {user?.name}</h1>
          <p className="text-sky-400 font-semibold">{user?.specialization}</p>
          <p className="text-slate-400 text-sm">{user?.department} • {user?.experience} years experience</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {label:"Today's Patients", value:todayAppts.length, icon:'👥', color:'#0ea5e9'},
          {label:'Upcoming', value:upcoming.length, icon:'📅', color:'#10b981'},
          {label:'All Appointments', value:appointments.length, icon:'📊', color:'#8b5cf6'},
          {label:'Prescriptions', value:prescriptions.length, icon:'💊', color:'#f59e0b'},
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between mb-3"><span className="text-xl">{s.icon}</span><div className="w-2 h-2 rounded-full" style={{background:s.color}}></div></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {/* Appointments */}
      {tab === 'appointments' && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="glass-card p-16 text-center"><p className="text-5xl mb-4">📅</p><p className="text-white font-bold text-lg">No appointments yet</p></div>
          ) : appointments.map((a) => (
            <div key={a._id} className="glass-card p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="avatar w-14 h-14 text-xl flex-shrink-0" style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)'}}>{a.patient?.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">{a.patient?.name}</p>
                  <p className="text-slate-400 text-sm">{a.patient?.phone} • {a.patient?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {a.patient?.gender && <span className="badge badge-blue">{a.patient.gender}</span>}
                    {a.patient?.bloodGroup && <span className="badge badge-red">{a.patient.bloodGroup}</span>}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{new Date(a.appointmentDate).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})} at {a.appointmentTime}</p>
                  {a.symptoms && <p className="text-slate-500 text-xs mt-0.5 truncate">Symptoms: {a.symptoms}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap sm:flex-shrink-0">
                <div className="text-center"><p className="text-xs text-slate-500">Token</p><p className="text-sky-400 font-bold text-lg">#{a.tokenNumber}</p></div>
                <StatusBadge status={a.status} />
                <button onClick={() => openPrescModal(a)} className="btn btn-sm btn-success">+ Prescription</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescriptions */}
      {tab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p._id} className="glass-card p-5">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="avatar w-10 h-10 text-sm" style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)'}}>{p.patient?.name?.[0]}</div>
                  <div><p className="text-white font-bold">{p.patient?.name}</p><p className="text-slate-400 text-sm">{p.patient?.phone}</p></div>
                </div>
                <p className="text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl mb-3" style={{background:'rgba(14,165,233,0.05)',border:'1px solid rgba(14,165,233,0.1)'}}>
                <p className="text-xs text-slate-500 font-semibold">DIAGNOSIS</p>
                <p className="text-white text-sm mt-0.5">{p.diagnosis}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.medicines?.map((m,i) => <span key={i} className="badge badge-purple">💊 {m.name}</span>)}
                {p.injections?.map((inj,i) => <span key={i} className="badge badge-orange">💉 {inj.name}</span>)}
                {p.nextCheckupDate && <span className="badge badge-green">📅 Next: {new Date(p.nextCheckupDate).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && <div className="glass-card p-16 text-center"><p className="text-5xl mb-4">💊</p><p className="text-white font-bold text-lg">No prescriptions written yet</p></div>}
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="glass-card p-6 max-w-lg">
          <h3 className="section-title mb-5">Doctor Profile</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Full Name', `Dr. ${user?.name}`],['Email', user?.email],['Phone', user?.phone],
              ['Specialization', user?.specialization],['Department', user?.department],
              ['Experience', `${user?.experience} years`],['Consultation Fee', `₹${user?.consultationFee}`],
              ['Qualifications', user?.qualifications],['About', user?.about],
            ].filter(([,v]) => v).map(([k,v]) => (
              <div key={k} className="flex justify-between py-2.5" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span className="text-slate-500 flex-shrink-0 mr-4">{k}</span>
                <span className="text-white text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {prescModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">Add Prescription</h3>
                <p className="text-slate-400 text-sm mt-0.5">Patient: <span className="text-sky-400 font-semibold">{prescModal.patient?.name}</span> • Token #{prescModal.tokenNumber}</p>
              </div>
              <button onClick={() => setPrescModal(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="space-y-5">
              {/* Diagnosis */}
              <div className="form-group">
                <label className="form-label">Diagnosis *</label>
                <textarea className="input" rows={3} placeholder="Enter detailed diagnosis..." value={prescForm.diagnosis} onChange={(e) => setPrescForm((p) => ({...p,diagnosis:e.target.value}))} />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label">Medicines</label>
                  <button onClick={addMed} className="btn btn-ghost btn-sm">+ Add Medicine</button>
                </div>
                <div className="space-y-3">
                  {prescForm.medicines.map((m,i) => (
                    <div key={i} className="p-4 rounded-xl relative" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
                      {prescForm.medicines.length > 1 && (
                        <button onClick={() => removeMed(i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-xs">✕</button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="form-group"><label className="form-label">Name</label><input className="input text-sm" placeholder="Medicine name" value={m.name} onChange={(e) => updateMed(i,'name',e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Dosage</label><input className="input text-sm" placeholder="e.g. 500mg" value={m.dosage} onChange={(e) => updateMed(i,'dosage',e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Frequency</label><input className="input text-sm" placeholder="e.g. 3x daily" value={m.frequency} onChange={(e) => updateMed(i,'frequency',e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Duration</label><input className="input text-sm" placeholder="e.g. 7 days" value={m.duration} onChange={(e) => updateMed(i,'duration',e.target.value)} /></div>
                        <div className="form-group col-span-2"><label className="form-label">Special Instructions</label><input className="input text-sm" placeholder="e.g. Take after meals" value={m.instructions} onChange={(e) => updateMed(i,'instructions',e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Injections */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label">Injections</label>
                  <button onClick={addInj} className="btn btn-ghost btn-sm">+ Add Injection</button>
                </div>
                {prescForm.injections.map((inj,i) => (
                  <div key={i} className="p-4 rounded-xl relative mb-2" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <button onClick={() => removeInj(i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-xs">✕</button>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="form-group"><label className="form-label">Name</label><input className="input text-sm" placeholder="Injection name" value={inj.name} onChange={(e) => updateInj(i,'name',e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">Dosage</label><input className="input text-sm" placeholder="e.g. 1ml" value={inj.dosage} onChange={(e) => updateInj(i,'dosage',e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">Schedule</label><input className="input text-sm" placeholder="e.g. Once weekly" value={inj.schedule} onChange={(e) => updateInj(i,'schedule',e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Other fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Next Checkup Date</label>
                  <input type="date" className="input" value={prescForm.nextCheckupDate} onChange={(e) => setPrescForm((p)=>({...p,nextCheckupDate:e.target.value}))} style={{colorScheme:'dark'}} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dietary Advice</label>
                  <input className="input" placeholder="e.g. Low-salt diet" value={prescForm.dietaryAdvice} onChange={(e) => setPrescForm((p)=>({...p,dietaryAdvice:e.target.value}))} />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Additional Notes</label>
                  <textarea className="input" rows={2} placeholder="Any other instructions..." value={prescForm.notes} onChange={(e) => setPrescForm((p)=>({...p,notes:e.target.value}))} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPrescModal(null)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={submitPrescription} className="btn btn-primary flex-1 py-3">Save Prescription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
