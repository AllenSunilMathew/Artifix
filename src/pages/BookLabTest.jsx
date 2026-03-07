import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
  '10:30', '11:00', '11:30', '12:00', '14:00', '14:30',
  '15:00', '15:30', '16:00',
];

export default function BookLabTest() {
  const [catalog, setCatalog] = useState({});
  const [openCat, setOpenCat] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedCatName, setSelectedCatName] = useState('');
  const [form, setForm] = useState({ scheduledDate: '', scheduledTime: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/lab-tests/catalog')
      .then((r) => setCatalog(r.data))
      .catch(() => toast.error('Failed to load test catalog'));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!selectedSub) { toast.error('Please select a test'); return; }
    if (!form.scheduledDate) { toast.error('Please select a date'); return; }
    if (!form.scheduledTime) { toast.error('Please select a time'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/lab-tests', {
        testCategory: selectedCatName,
        testName: selectedSub.name,
        subCategory: selectedSub.name,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        amount: selectedSub.price,
      });
      toast.success(`✓ Lab test booked! Token ${res.data.tokenNumber}`);
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/patient" className="btn btn-ghost btn-sm">← Back</Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Book Lab Test</h1>
          <p className="text-slate-400 text-sm mt-1">10 categories • 30+ tests • Pay at the lab</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Test catalog */}
        <div className="lg:col-span-3">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#10b981' }}>1</span>
            Select Test
          </h2>
          <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {Object.entries(catalog).map(([catName, catData]) => (
              <div key={catName}>
                <button
                  onClick={() => setOpenCat(openCat === catName ? '' : catName)}
                  className="w-full text-left glass-card p-4 flex items-center justify-between transition-all"
                  style={openCat === catName ? { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{catData.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{catName}</p>
                      <p className="text-slate-500 text-xs">{catData.description}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${openCat === catName ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openCat === catName && (
                  <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                    {catData.subcategories.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedSub(sub); setSelectedCatName(catName); }}
                        className="w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between"
                        style={
                          selectedSub?.name === sub.name
                            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }
                            : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }
                        }
                      >
                        <div>
                          <p className="text-slate-200 text-sm font-medium">{sub.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{sub.description}</p>
                          <p className="text-slate-500 text-xs">Turnaround: {sub.turnaround}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-emerald-400 font-bold text-sm">₹{sub.price}</p>
                          {selectedSub?.name === sub.name && (
                            <span className="badge badge-green mt-1">Selected</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#0ea5e9' }}>2</span>
            Schedule Test
          </h2>

          <div className="glass-card p-5 space-y-5">
            <div className="form-group">
              <label className="form-label">Test Date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={form.scheduledDate}
                onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="form-label mb-2 block">Time Slot</label>
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((p) => ({ ...p, scheduledTime: t }))}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={
                      form.scheduledTime === t
                        ? { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {selectedSub && form.scheduledDate && form.scheduledTime && (
              <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Booking Summary</p>
                {[
                  ['Category', selectedCatName],
                  ['Test', selectedSub.name],
                  ['Date', new Date(form.scheduledDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
                  ['Time', form.scheduledTime],
                  ['Amount', `₹${selectedSub.price}`],
                  ['Payment', 'Pay at Lab'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className={k === 'Amount' ? 'text-emerald-400 font-bold' : k === 'Payment' ? 'text-yellow-400' : 'text-white font-medium'}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#fde047' }}>
              ⚠ Arrive 10 min before your slot. 30+ min late = slot forfeited. Payment is collected at the lab counter.
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedSub || !form.scheduledDate || !form.scheduledTime}
              className="btn btn-success w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><div className="spinner"></div> Booking...</span>
              ) : (
                'Confirm Lab Test Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
