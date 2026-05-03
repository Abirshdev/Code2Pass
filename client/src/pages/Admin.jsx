import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

const tabs = ['departments', 'courses', 'lessons', 'questions', 'users'];

export default function Admin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [deptForm, setDeptForm] = useState({ _id: '', name: '', code: '', description: '' });
  const [courseForm, setCourseForm] = useState({
    _id: '',
    title: '',
    departmentId: '',
    year: 1,
    description: '',
  });
  const [lessonForm, setLessonForm] = useState({
    _id: '',
    title: '',
    courseId: '',
    content: '',
    videoUrl: '',
    codeExamples: '',
  });
  const [qForm, setQForm] = useState({
    _id: '',
    questionText: '',
    courseId: '',
    options: 'A\nB\nC\nD',
    correctAnswer: 0,
    explanation: '',
  });

  async function refresh() {
    setErr('');
    try {
      const [d, c] = await Promise.all([api('/api/departments'), api('/api/courses')]);
      setDepartments(d);
      setCourses(c);
      if (tab === 'lessons' && lessonForm.courseId) {
        setLessons(await api(`/api/lessons?courseId=${lessonForm.courseId}`));
      }
      if (tab === 'questions' && qForm.courseId) {
        setQuestions(await api(`/api/questions?courseId=${qForm.courseId}`));
      }
      if (tab === 'users') setUsers(await api('/api/users'));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== 'lessons') return;
    if (!lessonForm.courseId) {
      setLessons([]);
      return;
    }
    api(`/api/lessons?courseId=${lessonForm.courseId}`)
      .then(setLessons)
      .catch(() => setLessons([]));
  }, [tab, lessonForm.courseId]);

  useEffect(() => {
    if (tab !== 'questions') return;
    if (!qForm.courseId) {
      setQuestions([]);
      return;
    }
    api(`/api/questions?courseId=${qForm.courseId}`)
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [tab, qForm.courseId]);

  const emptyDept = { _id: '', name: '', code: '', description: '' };

  async function submitDepartment(e) {
    e.preventDefault();
    setMsg('');
    try {
      const { _id, ...body } = deptForm;
      if (_id) {
        await api(`/api/departments/${_id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/departments', { method: 'POST', body: JSON.stringify(body) });
      }
      setDeptForm(emptyDept);
      setMsg('Saved');
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteDepartment(id) {
    if (!confirm('Delete department?')) return;
    await api(`/api/departments/${id}`, { method: 'DELETE' });
    refresh();
  }

  const emptyCourse = { _id: '', title: '', departmentId: '', year: 1, description: '' };

  async function submitCourse(e) {
    e.preventDefault();
    setMsg('');
    try {
      const { _id, ...body } = courseForm;
      if (_id) {
        await api(`/api/courses/${_id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/courses', { method: 'POST', body: JSON.stringify(body) });
      }
      setCourseForm(emptyCourse);
      setMsg('Saved');
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete course?')) return;
    await api(`/api/courses/${id}`, { method: 'DELETE' });
    refresh();
  }

  async function submitLesson(e) {
    e.preventDefault();
    setMsg('');
    try {
      const codeExamples = lessonForm.codeExamples
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        title: lessonForm.title,
        courseId: lessonForm.courseId,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl,
        codeExamples,
      };
      if (lessonForm._id) {
        await api(`/api/lessons/${lessonForm._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/lessons', { method: 'POST', body: JSON.stringify(payload) });
      }
      setLessonForm((f) => ({
        ...f,
        _id: '',
        title: '',
        content: '',
        videoUrl: '',
        codeExamples: '',
      }));
      setMsg('Saved');
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteLesson(id) {
    if (!confirm('Delete lesson?')) return;
    await api(`/api/lessons/${id}`, { method: 'DELETE' });
    refresh();
  }

  async function submitQuestion(e) {
    e.preventDefault();
    setMsg('');
    try {
      const options = qForm.options.split('\n').map((s) => s.trim()).filter(Boolean);
      const payload = {
        questionText: qForm.questionText,
        courseId: qForm.courseId,
        options,
        correctAnswer: Number(qForm.correctAnswer),
        explanation: qForm.explanation,
      };
      if (qForm._id) {
        await api(`/api/questions/${qForm._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/questions', { method: 'POST', body: JSON.stringify(payload) });
      }
      setQForm((f) => ({
        ...f,
        _id: '',
        questionText: '',
        explanation: '',
        options: 'A\nB\nC\nD',
        correctAnswer: 0,
      }));
      setMsg('Saved');
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete question?')) return;
    await api(`/api/questions/${id}`, { method: 'DELETE' });
    refresh();
  }

  async function setUserRole(id, role) {
    await api(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
    refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
      {msg && <p className="text-green-600 text-sm">{msg}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <div className="flex flex-wrap gap-2">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === k ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            {t(`admin.${k}`)}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={submitDepartment} className="space-y-3 rounded-xl border p-4 dark:border-slate-800">
            <h2 className="font-semibold">
              {deptForm._id ? t('admin.edit') : t('admin.add')} {t('admin.departments')}
            </h2>
            <input
              placeholder="Name"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
            />
            <input
              placeholder="Code (e.g. CS)"
              required
              value={deptForm.code}
              onChange={(e) => setDeptForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
            />
            <textarea
              placeholder="Description"
              value={deptForm.description}
              onChange={(e) => setDeptForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2">
                {deptForm._id ? t('admin.update') : t('admin.save')}
              </button>
              {deptForm._id && (
                <button type="button" className="rounded-lg border px-4 py-2" onClick={() => setDeptForm(emptyDept)}>
                  {t('admin.cancelEdit')}
                </button>
              )}
            </div>
          </form>
          <ul className="space-y-2 text-sm">
            {departments.map((d) => (
              <li
                key={d._id}
                className="flex flex-wrap justify-between gap-2 border rounded-lg p-2 dark:border-slate-800"
              >
                <span>
                  {d.name} ({d.code})
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-brand-600 dark:text-brand-400"
                    onClick={() =>
                      setDeptForm({
                        _id: d._id,
                        name: d.name,
                        code: d.code,
                        description: d.description || '',
                      })
                    }
                  >
                    {t('admin.edit')}
                  </button>
                  <button type="button" className="text-red-600" onClick={() => deleteDepartment(d._id)}>
                    {t('admin.delete')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={submitCourse} className="space-y-3 rounded-xl border p-4 dark:border-slate-800">
            <h2 className="font-semibold">
              {courseForm._id ? t('admin.edit') : t('admin.add')} {t('admin.courses')}
            </h2>
            <select
              required
              value={courseForm.departmentId}
              onChange={(e) => setCourseForm((f) => ({ ...f, departmentId: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            >
              <option value="">{t('admin.selectDept')}</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Title"
              required
              value={courseForm.title}
              onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            />
            <input
              type="number"
              min={1}
              max={4}
              value={courseForm.year}
              onChange={(e) => setCourseForm((f) => ({ ...f, year: Number(e.target.value) }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            />
            <textarea
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2">
                {courseForm._id ? t('admin.update') : t('admin.save')}
              </button>
              {courseForm._id && (
                <button type="button" className="rounded-lg border px-4 py-2" onClick={() => setCourseForm(emptyCourse)}>
                  {t('admin.cancelEdit')}
                </button>
              )}
            </div>
          </form>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {courses.map((c) => (
              <li
                key={c._id}
                className="flex flex-wrap justify-between gap-2 border rounded-lg p-2 dark:border-slate-800"
              >
                <span>
                  {c.title} (Y{c.year})
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-brand-600 dark:text-brand-400"
                    onClick={() =>
                      setCourseForm({
                        _id: c._id,
                        title: c.title,
                        departmentId: c.departmentId,
                        year: c.year,
                        description: c.description || '',
                      })
                    }
                  >
                    {t('admin.edit')}
                  </button>
                  <button type="button" className="text-red-600" onClick={() => deleteCourse(c._id)}>
                    {t('admin.delete')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'lessons' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={submitLesson} className="space-y-3 rounded-xl border p-4 dark:border-slate-800">
            <h2 className="font-semibold">
              {lessonForm._id ? t('admin.edit') : t('admin.add')} {t('admin.lessons')}
            </h2>
            <select
              required
              value={lessonForm.courseId}
              onChange={(e) => setLessonForm((f) => ({ ...f, courseId: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            >
              <option value="">{t('admin.selectCourse')}</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            <input
              placeholder="Title"
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            />
            <input
              placeholder="Video URL"
              value={lessonForm.videoUrl}
              onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            />
            <textarea
              placeholder="Notes (markdown-ish text)"
              value={lessonForm.content}
              onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={4}
            />
            <textarea
              placeholder="Code examples (one per line)"
              value={lessonForm.codeExamples}
              onChange={(e) => setLessonForm((f) => ({ ...f, codeExamples: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={3}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2">
                {lessonForm._id ? t('admin.update') : t('admin.save')}
              </button>
              {lessonForm._id && (
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2"
                  onClick={() =>
                    setLessonForm({
                      _id: '',
                      title: '',
                      courseId: lessonForm.courseId,
                      content: '',
                      videoUrl: '',
                      codeExamples: '',
                    })
                  }
                >
                  {t('admin.cancelEdit')}
                </button>
              )}
            </div>
          </form>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {lessons.map((l) => (
              <li
                key={l._id}
                className="flex flex-wrap justify-between gap-2 border rounded-lg p-2 dark:border-slate-800"
              >
                <span>{l.title}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-brand-600 dark:text-brand-400"
                    onClick={() =>
                      setLessonForm({
                        _id: l._id,
                        title: l.title,
                        courseId: l.courseId,
                        content: l.content || '',
                        videoUrl: l.videoUrl || '',
                        codeExamples: (l.codeExamples || []).join('\n'),
                      })
                    }
                  >
                    {t('admin.edit')}
                  </button>
                  <button type="button" className="text-red-600" onClick={() => deleteLesson(l._id)}>
                    {t('admin.delete')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'questions' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={submitQuestion} className="space-y-3 rounded-xl border p-4 dark:border-slate-800">
            <h2 className="font-semibold">
              {qForm._id ? t('admin.edit') : t('admin.add')} {t('admin.questions')}
            </h2>
            <select
              required
              value={qForm.courseId}
              onChange={(e) => setQForm((f) => ({ ...f, courseId: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
            >
              <option value="">{t('admin.selectCourse')}</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Question"
              required
              value={qForm.questionText}
              onChange={(e) => setQForm((f) => ({ ...f, questionText: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={3}
            />
            <textarea
              placeholder="Options (one per line)"
              value={qForm.options}
              onChange={(e) => setQForm((f) => ({ ...f, options: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={4}
            />
            <label className="block text-sm">
              Correct index (0 = first option)
              <input
                type="number"
                min={0}
                value={qForm.correctAnswer}
                onChange={(e) => setQForm((f) => ({ ...f, correctAnswer: Number(e.target.value) }))}
                className="w-full mt-1 rounded border px-3 py-2 dark:bg-slate-900"
              />
            </label>
            <textarea
              placeholder="Explanation"
              value={qForm.explanation}
              onChange={(e) => setQForm((f) => ({ ...f, explanation: e.target.value }))}
              className="w-full rounded border px-3 py-2 dark:bg-slate-900"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2">
                {qForm._id ? t('admin.update') : t('admin.save')}
              </button>
              {qForm._id && (
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2"
                  onClick={() =>
                    setQForm({
                      _id: '',
                      questionText: '',
                      courseId: qForm.courseId,
                      options: 'A\nB\nC\nD',
                      correctAnswer: 0,
                      explanation: '',
                    })
                  }
                >
                  {t('admin.cancelEdit')}
                </button>
              )}
            </div>
          </form>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {questions.map((q) => (
              <li
                key={q._id}
                className="flex justify-between gap-2 border rounded-lg p-2 dark:border-slate-800"
              >
                <span className="line-clamp-2">{q.questionText}</span>
                <span className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    className="text-brand-600 dark:text-brand-400"
                    onClick={() =>
                      setQForm({
                        _id: q._id,
                        questionText: q.questionText,
                        courseId: q.courseId,
                        options: (q.options || []).join('\n'),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || '',
                      })
                    }
                  >
                    {t('admin.edit')}
                  </button>
                  <button type="button" className="text-red-600" onClick={() => deleteQuestion(q._id)}>
                    {t('admin.delete')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'users' && (
        <ul className="space-y-2 text-sm max-w-xl">
          {users.map((u) => (
            <li key={u._id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3 dark:border-slate-800">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-slate-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase">{u.role}</span>
                {u.role === 'student' ? (
                  <button
                    type="button"
                    className="text-xs border rounded px-2 py-1"
                    onClick={() => setUserRole(u._id, 'admin')}
                  >
                    Make admin
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs border rounded px-2 py-1"
                    onClick={() => setUserRole(u._id, 'student')}
                  >
                    Make student
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
