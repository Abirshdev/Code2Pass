import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api(`/api/courses/${id}`), api(`/api/lessons?courseId=${id}`)])
      .then(([c, l]) => {
        setCourse(c);
        setLessons(l.sort((a, b) => (a.order || 0) - (b.order || 0)));
      })
      .catch((e) => setErr(e.message));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    api(`/api/progress/course/${id}`)
      .then(setProgress)
      .catch(() => setProgress(null));
  }, [user, id]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!course) return <p className="text-slate-500">Loading…</p>;

  const doneSet = new Set((progress?.completedLessonIds || []).map((x) => String(x)));

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/departments/${course.departmentId}/courses`} className="text-sm text-brand-600 dark:text-brand-400">
          ← {t('departments.title')}
        </Link>
        <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('courses.year')} {course.year}
        </p>
      </div>

      {user && progress && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
          <p className="font-medium">{t('courses.progress')}</p>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all"
              style={{ width: `${progress.percent || 0}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {progress.completedLessons ?? 0} / {progress.totalLessons ?? 0} lessons
            {progress.courseCompleted && ` · ${t('courses.completed')}`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/courses/${id}/quiz`}
          className="inline-flex rounded-xl bg-brand-600 text-white px-5 py-2.5 font-semibold"
        >
          {t('courses.quiz')}
        </Link>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">{t('courses.lessons')}</h2>
        <ul className="space-y-2">
          {lessons.map((l) => (
            <li key={l._id}>
              <Link
                to={`/lessons/${l._id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span>{l.title}</span>
                {doneSet.has(String(l._id)) && (
                  <span className="text-xs text-green-600 dark:text-green-400">{t('courses.completed')}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
