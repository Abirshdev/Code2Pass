import { Router } from 'express';
import Question from '../models/Question.js';
import { authRequired, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { courseId } = req.query;
    const q = courseId ? { courseId } : {};
    const items = await Question.find(q).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const item = await Question.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { questionText, options, correctAnswer, explanation, courseId } = req.body;
    if (!questionText || !Array.isArray(options) || options.length < 2 || courseId == null) {
      return res.status(400).json({ message: 'Invalid question payload' });
    }
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ message: 'correctAnswer must index options' });
    }
    const item = await Question.create({
      questionText,
      options,
      correctAnswer,
      explanation: explanation || '',
      courseId,
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { questionText, options, correctAnswer, explanation, courseId } = req.body;
    const item = await Question.findByIdAndUpdate(
      req.params.id,
      { questionText, options, correctAnswer, explanation, courseId },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
