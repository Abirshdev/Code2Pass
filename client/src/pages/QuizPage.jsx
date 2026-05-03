import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function QuizPage() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api('/api/quiz/course/start', {
      method: 'POST',
      body: JSON.stringify({ courseId, count: 10 }),
    })
      .then((data) => {
        setQuestions(data.questions || []);
        setAnswers({});
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [courseId, user]);

  if (!user) {
    return (
      <p>
        <Link to="/login" className="text-brand-600">
          {t('nav.login')}
        </Link>{' '}
        to take the quiz.
      </p>
    );
  }

  async function submit() {
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        courseId,
        answers: questions.map((q) => ({
          questionId: q._id,
          selected: answers[q._id] ?? -1,
        })),
      };
      const data = await api('/api/quiz/course/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      nav(`/quiz/result/${data.resultId}`, { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (err && !questions.length) return <p className="text-red-600">{err}</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to={`/courses/${courseId}`} className="text-sm text-brand-600">
        ← {t('courses.title')}
      </Link>
      <h1 className="text-2xl font-bold">{t('quiz.title')}</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <ol className="space-y-6">
        {questions.map((q, idx) => (
          <li key={q._id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <p className="font-medium text-sm text-slate-500 mb-2">
              {t('quiz.question')} {idx + 1} {t('quiz.of')} {questions.length}
            </p>
            <p className="mb-3">{q.questionText}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={q._id}
                    checked={answers[q._id] === i}
                    onChange={() => setAnswers((a) => ({ ...a, [q._id]: i }))}
                    className="mt-1"
                  />
                  <span>
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        disabled={submitting || questions.some((q) => answers[q._id] == null)}
        onClick={submit}
        className="rounded-xl bg-brand-600 text-white px-6 py-3 font-semibold disabled:opacity-50"
      >
        {submitting ? '…' : t('quiz.submit')}
      </button>
    </div>
  );
}
