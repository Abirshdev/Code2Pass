import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

export default function DepartmentCourses() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [dept, setDept] = useState(null);
  const [courses, setCourses] = useState([]);
  const [year, setYear] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api(`/api/departments/${id}`), api(`/api/courses?departmentId=${id}`)])
      .then(([d, c]) => {
        setDept(d);
        setCourses(c);
      })
      .catch((e) => setErr(e.message));
  }, [id]);

  const filtered = useMemo(() => {
    if (!year) return courses;
    return courses.filter((c) => String(c.year) === year);
  }, [courses, year]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!dept) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dept.name}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('courses.title')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-400">{t('courses.year')}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="">{t('courses.allYears')}</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>{t('courses.noCourses')}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li
              key={c._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <div>
                <Link to={`/courses/${c._id}`} className="font-medium text-brand-700 dark:text-brand-400">
                  {c.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {t('courses.year')} {c.year}
                </p>
              </div>
              <Link
                to={`/courses/${c._id}`}
                className="text-sm rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5"
              >
                {t('courses.lessons')} →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to={`/exit-exam/${id}`} className="inline-block text-brand-600 dark:text-brand-400 font-medium">
        {t('departments.exitExam')} →
      </Link>
    </div>
  );
}
