import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.tokens.accessToken);
      navigate('/');
    } catch {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (role: 'employee' | 'manager' | 'hr') => {
    const demos = {
      employee: { email: 'anna@firma.pl', password: 'demo123' },
      manager: { email: 'tomek@firma.pl', password: 'demo123' },
      hr: { email: 'kasia@firma.pl', password: 'demo123' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].password);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex flex-col">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 px-6">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-cyan-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TimeOff</h1>
          <p className="text-gray-400">Zarządzaj urlopami z łatwością</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                placeholder="Hasło"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg shadow-cyan-500/25"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-8">
            <p className="text-center text-gray-500 text-sm mb-4">Szybkie logowanie (demo)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: 'employee', label: 'Pracownik', color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                { role: 'manager', label: 'Manager', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
                { role: 'hr', label: 'HR Admin', color: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => setDemo(item.role as any)}
                  className={`p-3 bg-gradient-to-br ${item.color} ${item.border} border rounded-2xl text-center transition-all hover:scale-105`}
                >
                  <span className={`text-xs font-medium ${item.text}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-gray-600 text-sm">
        © 2026 TimeOff. Wersja demo.
      </div>
    </div>
  );
}
