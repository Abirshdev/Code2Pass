import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [results, setResults] = useState([]);

  useEffect(() => {
    api('/api/quiz/results?limit=15')
      .then(setResults)
      .catch(() => setResults([]));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('dashboard.welcome')}, {user?.name}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/departments"
          className="rounded-xl bg-brand-600 text-white px-5 py-2.5 font-medium"
        >
          {t('nav.departments')}
        </Link>
        <Link to="/certificates" className="rounded-xl border px-5 py-2.5 font-medium">
          {t('nav.certificates')}
        </Link>
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">{t('dashboard.recent')}</h2>
        {results.length === 0 ? (
          <p className="text-slate-500">{t('dashboard.noResults')}</p>
        ) : (
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r._id}>
                <Link
                  to={`/quiz/result/${r._id}`}
                  className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span>
                    {r.mode === 'exit_exam'
                      ? `Exit exam · ${r.departmentId?.name || ''}`
                      : r.courseId?.title || 'Quiz'}
                  </span>
                  <span className="font-semibold text-brand-700 dark:text-brand-400">{r.score}%</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
