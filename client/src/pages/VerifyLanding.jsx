import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function VerifyLanding() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [id, setId] = useState('');

  function go(e) {
    e.preventDefault();
    const trimmed = id.trim();
    if (trimmed) nav(`/verify/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('verify.title')}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Enter the certificate ID printed on the PDF (for example BDU-CS-2026-0001).
      </p>
      <form onSubmit={go} className="flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="BDU-IT-2026-0001"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
        />
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Go
        </button>
      </form>
    </div>
  );
}
