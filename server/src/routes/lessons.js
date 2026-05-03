import { Router } from 'express';
import Lesson from '../models/Lesson.js';
import { authRequired, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const q = courseId ? { courseId } : {};
    const items = await Lesson.find(q).sort({ order: 1, title: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id).lean();
    if (!l) return res.status(404).json({ message: 'Lesson not found' });
    res.json(l);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { title, content, videoUrl, codeExamples, courseId, order } = req.body;
    if (!title || !courseId) return res.status(400).json({ message: 'title and courseId required' });
    const l = await Lesson.create({
      title,
      content: content || '',
      videoUrl: videoUrl || '',
      codeExamples: codeExamples || [],
      courseId,
      order: order ?? 0,
    });
    res.status(201).json(l);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { title, content, videoUrl, codeExamples, courseId, order } = req.body;
    const l = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, content, videoUrl, codeExamples, courseId, order },
      { new: true, runValidators: true }
    );
    if (!l) return res.status(404).json({ message: 'Not found' });
    res.json(l);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
