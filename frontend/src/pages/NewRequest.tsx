import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { requestsApi } from '../api/client';
import { ArrowLeft, Calendar } from 'lucide-react';

const leaveTypes = [
  { value: 'VACATION', label: 'Urlop wypoczynkowy', emoji: '🏖️' },
  { value: 'SICK_LEAVE', label: 'Zwolnienie lekarskie', emoji: '🏥' },
  { value: 'REMOTE_WORK', label: 'Praca zdalna', emoji: '🏠' },
  { value: 'PARENTAL', label: 'Urlop rodzicielski', emoji: '👶' },
  { value: 'TRAINING', label: 'Szkolenie', emoji: '🎓' },
  { value: 'OTHER', label: 'Inne', emoji: '📋' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateWorkingDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const workingDays = calculateWorkingDays(formData.startDate, formData.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestsApi.create({
        ...formData,
        workingDays,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Nowy wniosek urlopowy</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ nieobecności
            </label>
            <div className="grid grid-cols-2 gap-3">
              {leaveTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mr-2">{type.emoji}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data początkowa
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data końcowa
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {workingDays > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Liczba dni roboczych: <span className="font-bold text-blue-700">{workingDays}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Powód / Uzasadnienie
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Opcjonalne - dodaj szczegóły..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading || workingDays === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Wysyłanie...' : 'Złóż wniosek'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
