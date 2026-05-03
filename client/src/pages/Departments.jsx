import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

export default function Departments() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/departments')
      .then(setItems)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) {
    return <p className="text-red-600 dark:text-red-400">{err}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('departments.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('departments.subtitle')}</p>
      </div>
      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((d) => (
          <li
            key={d._id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col gap-3"
          >
            <div>
              <h2 className="font-semibold text-lg">{d.name}</h2>
              {d.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{d.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              <Link
                to={`/departments/${d._id}/courses`}
                className="inline-flex rounded-lg bg-brand-600 text-white text-sm px-4 py-2 font-medium"
              >
                {t('departments.open')}
              </Link>
              <Link
                to={`/exit-exam/${d._id}`}
                className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 text-sm px-4 py-2"
              >
                {t('departments.exitExam')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
