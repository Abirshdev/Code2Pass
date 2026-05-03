import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ExitExamPage() {
  const { departmentId } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuth();
  const [dept, setDept] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('loading');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api(`/api/departments/${departmentId}`)
      .then(setDept)
      .catch(() => setDept(null));
  }, [departmentId]);

  useEffect(() => {
    if (!user) return;
    setPhase('loading');
    api('/api/quiz/exit/start', {
      method: 'POST',
      body: JSON.stringify({ departmentId, count: 20 }),
    })
      .then((data) => {
        setQuestions(data.questions || []);
        setAnswers({});
        setPhase('exam');
      })
      .catch((e) => {
        setErr(e.message);
        setPhase('error');
      });
  }, [departmentId, user]);

  if (!user) {
    return (
      <p>
        <Link to="/login" className="text-brand-600">
          {t('nav.login')}
        </Link>{' '}
        for exit exam mode.
      </p>
    );
  }

  async function submit() {
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        departmentId,
        answers: questions.map((q) => ({
          questionId: q._id,
          selected: answers[q._id] ?? -1,
        })),
      };
      const data = await api('/api/quiz/exit/submit', {
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

  if (phase === 'loading') return <p className="text-slate-500">Preparing exam…</p>;
  if (phase === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-red-600">{err}</p>
        <Link to="/departments" className="text-brand-600">
          ← {t('departments.title')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
        <p className="font-semibold">{t('departments.exitExam')}</p>
        <p className="text-sm mt-1">{dept?.name}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Random questions from multiple courses. Submit when finished. Score ≥ 70% may earn a certificate.
        </p>
      </div>

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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={submitting || questions.some((q) => answers[q._id] == null)}
          onClick={submit}
          className="rounded-xl bg-brand-600 text-white px-6 py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? '…' : t('quiz.submit')}
        </button>
        <Link to="/departments" className="rounded-xl border px-6 py-3">
          Cancel
        </Link>
      </div>
    </div>
  );
}
