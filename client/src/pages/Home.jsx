import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('home.heroTitle')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{t('home.heroSub')}</p>
        <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 max-w-2xl mx-auto">
          {t('app.disclaimer')}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/departments"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 text-white px-6 py-3 font-semibold shadow hover:bg-brand-700"
          >
            {t('home.ctaBrowse')}
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600 px-6 py-3 font-semibold"
            >
              {t('home.ctaDashboard')}
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">{t('home.features')}</h2>
        <ul className="grid sm:grid-cols-2 gap-4">
          {[t('home.f1'), t('home.f2'), t('home.f3'), t('home.f4')].map((item) => (
            <li
              key={item}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
