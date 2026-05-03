import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white dark:bg-brand-500'
      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800'
  }`;

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="font-bold text-lg text-brand-700 dark:text-brand-400">
            {t('app.title')}
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/departments" className={linkClass}>
              {t('nav.departments')}
            </NavLink>
            <NavLink to="/verify" className={linkClass}>
              {t('nav.verify')}
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/certificates" className={linkClass}>
                  {t('nav.certificates')}
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={linkClass}>
                    {t('nav.admin')}
                  </NavLink>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <select
              value={i18n.language}
              onChange={(e) => {
                const lng = e.target.value;
                i18n.changeLanguage(lng);
                localStorage.setItem('lang', lng);
              }}
              className="text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              aria-label="Language"
            >
              <option value="en">{t('lang.en')}</option>
              <option value="am">{t('lang.am')}</option>
            </select>
            <button
              type="button"
              onClick={toggle}
              className="text-sm rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1"
            >
              {dark ? t('theme.light') : t('theme.dark')}
            </button>
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="text-sm rounded-lg bg-slate-200 dark:bg-slate-800 px-3 py-1.5"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm rounded-lg border border-brand-600 text-brand-700 dark:text-brand-400 px-3 py-1.5"
                >
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="text-sm rounded-lg bg-brand-600 text-white px-3 py-1.5">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 px-4">
        <p>{t('app.disclaimer')}</p>
      </footer>
    </div>
  );
}
