import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function QuizResultPage() {
  const { resultId } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) return;
    api(`/api/quiz/results/${resultId}`)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [resultId, user]);

  if (!user) {
    return (
      <p>
        <Link to="/login" className="text-brand-600">
          Login
        </Link>{' '}
        to view results.
      </p>
    );
  }
  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  const courseTitle = data.courseId?.title || data.departmentId?.name || '—';
  const backLink =
    data.mode === 'exit_exam' && data.departmentId?._id
      ? `/departments/${data.departmentId._id}/courses`
      : data.courseId?._id
        ? `/courses/${data.courseId._id}`
        : '/dashboard';

  return (
    <div className="space-y-8 max-w-3xl">
      <Link to={backLink} className="text-sm text-brand-600">
        ← Back
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{t('quiz.result')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{courseTitle}</p>
        <p className="text-3xl font-extrabold text-brand-700 dark:text-brand-400 mt-2">
          {data.score}%
        </p>
        <p className="text-sm text-slate-500">
          {t('quiz.correct')}: {data.correctCount} / {data.totalQuestions}
        </p>
      </div>

      <ul className="space-y-6">
        {(data.questions || []).map((q, idx) => (
          <li
            key={q.questionId || idx}
            className={`rounded-xl border p-4 ${
              q.correct
                ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20'
                : 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
            }`}
          >
            <p className="font-medium text-sm mb-2">
              {t('quiz.question')} {idx + 1}
            </p>
            <p className="mb-2">{q.questionText}</p>
            <p className="text-sm">
              <span className="text-slate-500">{t('quiz.yourAnswer')}: </span>
              {q.selected != null && q.options?.[q.selected] != null
                ? `${String.fromCharCode(65 + q.selected)}. ${q.options[q.selected]}`
                : '—'}
            </p>
            <p className="text-sm">
              <span className="text-slate-500">{t('quiz.rightAnswer')}: </span>
              {q.correctAnswer != null && q.options?.[q.correctAnswer] != null
                ? `${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}`
                : '—'}
            </p>
            {q.explanation && (
              <p className="text-sm mt-2 text-slate-700 dark:text-slate-300">
                <strong>{t('quiz.explain')}:</strong> {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ul>

      <Link to="/certificates" className="inline-block text-brand-600 font-medium">
        {t('nav.certificates')} →
      </Link>
    </div>
  );
}
