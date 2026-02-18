import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { requestsApi } from '../api/client';
import { ArrowLeft, Calendar, Sun, Umbrella, Home, Heart, GraduationCap, FileText } from 'lucide-react';

const leaveTypes = [
  { value: 'VACATION', label: 'Urlop wypoczynkowy', icon: Sun, color: 'from-yellow-500/20 to-amber-500/20' },
  { value: 'SICK_LEAVE', label: 'Zwolnienie lekarskie', icon: Umbrella, color: 'from-red-500/20 to-rose-500/20' },
  { value: 'REMOTE_WORK', label: 'Praca zdalna', icon: Home, color: 'from-blue-500/20 to-cyan-500/20' },
  { value: 'PARENTAL', label: 'Urlop rodzicielski', icon: Heart, color: 'from-pink-500/20 to-rose-500/20' },
  { value: 'TRAINING', label: 'Szkolenie', icon: GraduationCap, color: 'from-purple-500/20 to-violet-500/20' },
  { value: 'OTHER', label: 'Inne', icon: FileText, color: 'from-gray-500/20 to-slate-500/20' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [type, setType] = useState('VACATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const workingDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workingDays === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await requestsApi.create({ type, startDate, endDate, workingDays, reason });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = leaveTypes.find(t => t.value === type);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-white">Nowy wniosek</h1>
        </div>
      </header>

      {/* Form */}
      <div className="relative z-10 px-6 pb-8">
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selection */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Rodzaj nieobecności</label>
              <div className="grid grid-cols-2 gap-3">
                {leaveTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`p-4 rounded-2xl border transition-all ${
                      type === t.value 
                        ? 'bg-white/10 border-cyan-500/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <t.icon className={`w-6 h-6 mb-2 ${type === t.value ? 'text-cyan-400' : 'text-gray-400'}`} />
                    <span className="text-white text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Od</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Do</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Days counter */}
            {workingDays > 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Liczba dni roboczych</p>
                <p className="text-3xl font-bold text-cyan-400">{workingDays}</p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Powód (opcjonalnie)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Dodaj szczegóły..."
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || workingDays === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Wysyłanie...' : 'Złóż wniosek'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
