import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await register(name, email, password);
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t('auth.registerTitle')}</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.name')}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2"
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-semibold">
          {t('nav.register')}
        </button>
      </form>
      <p className="text-sm text-center text-slate-600">
        <Link to="/login" className="text-brand-600">
          {t('nav.login')}
        </Link>
      </p>
    </div>
  );
}
