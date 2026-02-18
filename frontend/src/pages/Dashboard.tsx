import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { requestsApi, balanceApi, reportsApi } from '../api/client';
import type { LeaveRequest, LeaveBalance } from '../types';
import { Plus, LogOut, Calendar, Sun, Umbrella, Home, Heart, GraduationCap, FileText, Check, X } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-500',
      MANAGER_APPROVED: 'bg-blue-500',
      HR_APPROVED: 'bg-emerald-500',
      REJECTED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      VACATION: Sun, SICK_LEAVE: Umbrella, REMOTE_WORK: Home,
      PARENTAL: Heart, TRAINING: GraduationCap, OTHER: FileText,
    };
    return icons[type] || FileText;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      VACATION: 'Urlop', SICK_LEAVE: 'L4', REMOTE_WORK: 'Remote',
      PARENTAL: 'Rodzicielski', TRAINING: 'Szkolenie', OTHER: 'Inne',
    };
    return labels[type] || type;
  };

  if (!user) return null;
  if (loading) return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
    </div>
  );

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">TimeOff</span>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Balance */}
      <div className="relative z-10 px-6 mb-8">
        <div className="max-w-lg mx-auto">
          {balance && user.role !== 'HR_ADMIN' && (
            <div className="text-center mb-2">
              <p className="text-gray-400 text-sm mb-1">Dostępne dni urlopu</p>
              <p className="text-7xl font-bold text-white mb-2">{balance.remaining}</p>
              <p className="text-gray-500">z {balance.totalDays} dni przysługuje w 2026</p>
            </div>
          )}

          <button
            onClick={() => navigate('/new-request')}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Dodaj wniosek
          </button>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && user.role !== 'EMPLOYEE' && (
        <div className="relative z-10 px-6 mb-6">
          <div className="max-w-lg mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-amber-400 font-medium">{pendingCount} wnios{pendingCount === 1 ? 'ek' : 'ki'} do akceptacji</p>
          </div>
        </div>
      )}

      {/* Requests list */}
      <div className="relative z-10 px-6 pb-8">
        <div className="max-w-lg mx-auto">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Ostatnie wnioski</h3>
          
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Brak wniosków</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req) => {
                const Icon = getTypeIcon(req.type);
                return (
                  <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{getTypeLabel(req.type)}</p>
                      <p className="text-gray-500 text-sm">{req.workingDays} dni • {req.startDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(req.status)}`} />
                      {req.status === 'PENDING' && user.role !== 'EMPLOYEE' && (
                        <div className="flex gap-1">
                          <button onClick={() => requestsApi.approve(req.id).then(loadData)} className="p-1.5 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button onClick={() => requestsApi.reject(req.id).then(loadData)} className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
