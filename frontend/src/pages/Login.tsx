import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuthStore } from '../stores/authStore';

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
    } catch (err: any) {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const setDemoCredentials = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      employee: { email: 'anna@firma.pl', password: 'demo123' },
      manager: { email: 'tomek@firma.pl', password: 'demo123' },
      hr: { email: 'kasia@firma.pl', password: 'demo123' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Leave</h1>
          <p className="text-gray-500 mt-2">System zarządzania urlopami</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="twoj@firma.pl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center mb-3">Szybkie logowanie (demo):</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDemoCredentials('employee')}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700"
            >
              Pracownik
            </button>
            <button
              onClick={() => setDemoCredentials('manager')}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700"
            >
              Manager
            </button>
            <button
              onClick={() => setDemoCredentials('hr')}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700"
            >
              HR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
