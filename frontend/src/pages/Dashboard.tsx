import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { requestsApi, balanceApi, reportsApi } from '../api/client';
import type { LeaveRequest, LeaveBalance } from '../types';
import { Calendar, CheckCircle, Clock, FileText, Plus, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [balanceRes, requestsRes] = await Promise.all([
        balanceApi.get(),
        requestsApi.getAll(),
      ]);
      setBalance(balanceRes.data);
      setRequests(requestsRes.data.requests);

      if (user?.role === 'HR_ADMIN') {
        const statsRes = await reportsApi.getSummary();
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      MANAGER_APPROVED: 'bg-blue-100 text-blue-700',
      HR_APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      PENDING: 'Oczekuje',
      MANAGER_APPROVED: 'Zaakcept. (mng)',
      HR_APPROVED: 'Zaakceptowane',
      REJECTED: 'Odrzucone',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      VACATION: '🏖️',
      SICK_LEAVE: '🏥',
      REMOTE_WORK: '🏠',
      PARENTAL: '👶',
    };
    return icons[type] || '📋';
  };

  if (!user) return null;
  if (loading) return <div className="p-8">Ładowanie...</div>;

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">HR Leave System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {user.role === 'EMPLOYEE' ? 'Pracownik' : user.role === 'MANAGER' ? 'Manager' : 'HR Admin'}
              </span>
            </span>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user.role !== 'HR_ADMIN' && balance && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dostępne dni</p>
                  <p className="text-3xl font-bold text-green-600">{balance.remaining}</p>
                  <p className="text-xs text-gray-400 mt-1">z {balance.totalDays} w 2026</p>
                </div>
                <Calendar className="w-10 h-10 text-green-500 opacity-50" />
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(balance.usedDays / balance.totalDays) * 100}%` }} />
              </div>
            </div>
          )}

          {(user.role === 'MANAGER' || user.role === 'HR_ADMIN') && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Do akceptacji</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500 opacity-50" />
              </div>
            </div>
          )}

          {user.role === 'HR_ADMIN' && stats && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Wszystkich</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalRequests}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => navigate('/new-request')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Nowy wniosek urlopowy
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.role === 'EMPLOYEE' ? 'Moje wnioski' : 'Wnioski'}
            </h2>
          </div>
          <div className="divide-y">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Brak wniosków</p>
              </div>
            ) : (
              requests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTypeIcon(req.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {req.type} od {req.startDate} do {req.endDate}
                      </p>
                      <p className="text-sm text-gray-500">{req.workingDays} dni roboczych</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(req.status)}
                    {req.status === 'PENDING' && user.role !== 'EMPLOYEE' && (
                      <>
                        <button onClick={() => requestsApi.approve(req.id).then(loadData)} className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">Akceptuj</button>
                        <button onClick={() => requestsApi.reject(req.id).then(loadData)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">Odrzuć</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
