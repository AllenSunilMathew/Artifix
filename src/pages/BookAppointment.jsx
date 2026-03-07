import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ appointmentDate: '', appointmentTime: '', symptoms: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/appointments/doctors')
      .then((r) => setDoctors(r.data))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setFetchingDoctors(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!selected) { toast.error('Please select a doctor'); return; }
    if (!form.appointmentDate) { toast.error('Please select a date'); return; }
    if (!form.appointmentTime) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/appointments', {
        doctorId: selected._id,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        symptoms: form.symptoms,
      });
      toast.success(`✓ Appointment booked! Your token is #${res.data.tokenNumber}`);
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/patient" className="btn btn-ghost btn-sm">← Back</Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Book Appointment</h1>
          <p className="text-slate-400 text-sm mt-1">Select a specialist and pick your preferred slot</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Doctor list — 3 cols */}
        <div className="lg:col-span-3">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#0ea5e9' }}
            >1</span>
            Choose a Doctor
          </h2>

          {fetchingDoctors ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => setSelected(doc)}
                  className="glass-card p-4 cursor-pointer transition-all"
                  style={
                    selected?._id === doc._id
                      ? { borderColor: '#0ea5e9', background: 'rgba(14,165,233,0.06)' }
                      : {}
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="avatar w-14 h-14 text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}
                    >
                      {doc.profilePicture ? (
                        <img src={`${API}${doc.profilePicture}`} alt="" />
                      ) : (
                        doc.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold">Dr. {doc.name}</p>
                      <p className="text-sky-400 text-sm">{doc.specialization}</p>
                      <p className="text-slate-500 text-xs">{doc.department} • {doc.experience} yrs exp</p>
                      <p className="text-emerald-400 text-xs font-semibold mt-0.5">₹{doc.consultationFee} consultation</p>
                    </div>
                    {selected?._id === doc._id && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#0ea5e9' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {doc.about && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2">{doc.about}</p>
                  )}
                </div>
              ))}
              {doctors.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <p className="text-4xl mb-3">🩺</p>
                  <p className="text-white font-semibold">No doctors available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking form — 2 cols */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#10b981' }}
            >2</span>
            Schedule Your Visit
          </h2>

          <div className="glass-card p-5 space-y-5">
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={form.appointmentDate}
                onChange={(e) => setForm((p) => ({ ...p, appointmentDate: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="form-label mb-2 block">Time Slot</label>
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((p) => ({ ...p, appointmentTime: t }))}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={
                      form.appointmentTime === t
                        ? { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white' }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#64748b',
                          }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Symptoms / Reason (optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe what you are experiencing..."
                value={form.symptoms}
                onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))}
              />
            </div>

            {/* Summary */}
            {selected && form.appointmentDate && form.appointmentTime && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)' }}
              >
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Booking Summary</p>
                {[
                  ['Doctor', `Dr. ${selected.name}`],
                  ['Specialization', selected.specialization],
                  ['Date', new Date(form.appointmentDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })],
                  ['Time', form.appointmentTime],
                  ['Fee', `₹${selected.consultationFee}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className={k === 'Fee' ? 'text-emerald-400 font-bold' : 'text-white font-medium'}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div
              className="p-3 rounded-xl text-xs"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#fde047' }}
            >
              ⚠ Please arrive at least 10 minutes early. Late arrivals (30+ mins) will not be accepted.
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selected || !form.appointmentDate || !form.appointmentTime}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><div className="spinner"></div> Confirming...</span>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
