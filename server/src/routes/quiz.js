import { Router } from 'express';
import Question from '../models/Question.js';
import QuizResult from '../models/QuizResult.js';
import Course from '../models/Course.js';
import { authRequired, attachUser } from '../middleware/auth.js';
import { issueCertificateIfEligible } from '../utils/issueCertificate.js';

const router = Router();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripAnswers(docs) {
  return docs.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    courseId: q.courseId,
  }));
}

router.post('/course/start', authRequired, attachUser, async (req, res) => {
  try {
    const { courseId, count = 10 } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });
    const all = await Question.find({ courseId }).lean();
    if (!all.length) return res.status(400).json({ message: 'No questions for this course' });
    const n = Math.min(Number(count) || 10, all.length);
    const picked = shuffle(all).slice(0, n);
    res.json({ questions: stripAnswers(picked), total: n });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/course/submit', authRequired, attachUser, async (req, res) => {
  try {
    const { courseId, answers } = req.body;
    if (!courseId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'courseId and answers[] required' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const ids = answers.map((a) => a.questionId).filter(Boolean);
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    const detail = [];
    for (const a of answers) {
      const q = byId[a.questionId];
      if (!q) continue;
      const ok = Number(a.selected) === q.correctAnswer;
      if (ok) correct += 1;
      detail.push({
        questionId: q._id,
        selected: a.selected,
        correct: ok,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        questionText: q.questionText,
        options: q.options,
      });
    }

    const total = detail.length;
    const score = total ? Math.round((correct / total) * 1000) / 10 : 0;

    const result = await QuizResult.create({
      userId: req.userId,
      courseId,
      departmentId: course.departmentId,
      mode: 'course_quiz',
      score,
      totalQuestions: total,
      correctCount: correct,
      answers: answers.map((a) => {
        const q = byId[a.questionId];
        return {
          questionId: a.questionId,
          selected: a.selected,
          correct: q ? Number(a.selected) === q.correctAnswer : false,
        };
      }),
    });

    let certificate = null;
    if (score >= 70) {
      certificate = await issueCertificateIfEligible({
        userId: req.userId,
        courseId,
        departmentId: course.departmentId,
        scorePercent: score,
        reason: 'quiz_pass',
      });
    }

    res.json({
      resultId: result._id,
      score,
      totalQuestions: total,
      correctCount: correct,
      questions: detail,
      certificate,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/exit/start', authRequired, attachUser, async (req, res) => {
  try {
    const { departmentId, count = 25 } = req.body;
    if (!departmentId) return res.status(400).json({ message: 'departmentId required' });
    const courses = await Course.find({ departmentId }).select('_id').lean();
    const courseIds = courses.map((c) => c._id);
    const all = await Question.find({ courseId: { $in: courseIds } }).lean();
    if (!all.length) {
      return res.status(400).json({ message: 'No questions in this department' });
    }
    const n = Math.min(Number(count) || 25, all.length);
    const picked = shuffle(all).slice(0, n);
    res.json({ questions: stripAnswers(picked), total: n });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/exit/submit', authRequired, attachUser, async (req, res) => {
  try {
    const { departmentId, answers } = req.body;
    if (!departmentId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'departmentId and answers[] required' });
    }
    const ids = answers.map((a) => a.questionId).filter(Boolean);
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    const detail = [];
    for (const a of answers) {
      const q = byId[a.questionId];
      if (!q) continue;
      const ok = Number(a.selected) === q.correctAnswer;
      if (ok) correct += 1;
      detail.push({
        questionId: q._id,
        selected: a.selected,
        correct: ok,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        questionText: q.questionText,
        options: q.options,
      });
    }

    const total = detail.length;
    const score = total ? Math.round((correct / total) * 1000) / 10 : 0;

    const result = await QuizResult.create({
      userId: req.userId,
      courseId: null,
      departmentId,
      mode: 'exit_exam',
      score,
      totalQuestions: total,
      correctCount: correct,
      answers: answers.map((a) => {
        const q = byId[a.questionId];
        return {
          questionId: a.questionId,
          selected: a.selected,
          correct: q ? Number(a.selected) === q.correctAnswer : false,
        };
      }),
    });

    let certificate = null;
    if (score >= 70) {
      certificate = await issueCertificateIfEligible({
        userId: req.userId,
        courseId: null,
        departmentId,
        scorePercent: score,
        reason: 'exit_exam_pass',
      });
    }

    res.json({
      resultId: result._id,
      score,
      totalQuestions: total,
      correctCount: correct,
      questions: detail,
      certificate,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/results', authRequired, attachUser, async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const items = await QuizResult.find({ userId: req.userId })
      .sort({ completedAt: -1 })
      .limit(Number(limit))
      .populate('courseId', 'title')
      .populate('departmentId', 'name')
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/results/:id', authRequired, attachUser, async (req, res) => {
  try {
    const r = await QuizResult.findOne({
      _id: req.params.id,
      userId: req.userId,
    })
      .populate('courseId', 'title')
      .populate('departmentId', 'name')
      .lean();
    if (!r) return res.status(404).json({ message: 'Not found' });

    const ids = r.answers.map((a) => a.questionId).filter(Boolean);
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(questions.map((q) => [q._id.toString(), q]));

    const detail = r.answers.map((a) => {
      const q = byId[a.questionId?.toString?.()];
      return {
        questionId: a.questionId,
        selected: a.selected,
        correct: a.correct,
        questionText: q?.questionText,
        options: q?.options,
        correctAnswer: q?.correctAnswer,
        explanation: q?.explanation,
      };
    });

    res.json({ ...r, questions: detail });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
