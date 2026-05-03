import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LessonPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api(`/api/lessons/${id}`)
      .then(setLesson)
      .catch((e) => setErr(e.message));
  }, [id]);

  async function markComplete() {
    if (!lesson) return;
    setMsg('');
    setErr('');
    try {
      const data = await api('/api/progress/lesson-complete', {
        method: 'POST',
        body: JSON.stringify({ courseId: lesson.courseId, lessonId: lesson._id }),
      });
      if (data.certificate) {
        setMsg(
          `${t('courses.completed')}. Certificate: ${data.certificate.certificateId}`
        );
      } else {
        setMsg(t('courses.completed'));
      }
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err && !lesson) return <p className="text-red-600">{err}</p>;
  if (!lesson) return <p className="text-slate-500">Loading…</p>;

  const videoId =
    lesson.videoUrl && lesson.videoUrl.includes('youtube.com/watch?v=')
      ? lesson.videoUrl.split('v=')[1]?.split('&')[0]
      : lesson.videoUrl && lesson.videoUrl.includes('youtu.be/')
        ? lesson.videoUrl.split('youtu.be/')[1]?.split('?')[0]
        : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to={`/courses/${lesson.courseId}`} className="text-sm text-brand-600 dark:text-brand-400">
        ← {t('lesson.back')}
      </Link>
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      {user && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={markComplete}
            className="rounded-lg bg-brand-600 text-white text-sm px-4 py-2"
          >
            {t('courses.markComplete')}
          </button>
          {msg && <span className="text-sm text-green-600 dark:text-green-400">{msg}</span>}
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      )}

      {lesson.videoUrl && (
        <section>
          <h2 className="font-semibold mb-2">{t('lesson.video')}</h2>
          {videoId ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black max-w-2xl">
              <iframe
                title="lesson-video"
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 dark:text-brand-400 underline"
            >
              {lesson.videoUrl}
            </a>
          )}
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-2">{t('lesson.notes')}</h2>
        <pre className="whitespace-pre-wrap text-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
          {lesson.content || '—'}
        </pre>
      </section>

      {lesson.codeExamples?.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">{t('lesson.code')}</h2>
          {lesson.codeExamples.map((code, i) => (
            <pre
              key={i}
              className="text-sm rounded-xl bg-slate-900 text-slate-100 p-4 overflow-x-auto mb-2"
            >
              {code}
            </pre>
          ))}
        </section>
      )}
    </div>
  );
}
