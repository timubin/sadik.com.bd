import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const LoginPage: React.FC = () => {
  const { login, register, showToast } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(email, password);
        navigate(u.role === 'admin' || u.role === 'staff' ? '/admin' : '/account');
      } else {
        await register(name, email, phone, password, passwordConfirm);
        navigate('/account');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-lg py-2 text-sm font-bold ${
              mode === 'login' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-lg py-2 text-sm font-bold ${
              mode === 'register' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </>
          )}

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />

          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />

          {mode === 'register' && (
            <input
              required
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
            <p className="mb-2 font-bold">Demo Quick Fill:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@sadik.com.bd');
                  setPassword('password');
                }}
                className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200 dark:bg-slate-800"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('customer@sadik.com.bd');
                  setPassword('password');
                }}
                className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200 dark:bg-slate-800"
              >
                Customer Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
