import { Router } from 'express';
import Course from '../models/Course.js';
import { authRequired, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { departmentId, year } = req.query;
    const q = {};
    if (departmentId) q.departmentId = departmentId;
    if (year) q.year = Number(year);
    const items = await Course.find(q).sort({ year: 1, order: 1, title: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await Course.findById(req.params.id).lean();
    if (!c) return res.status(404).json({ message: 'Course not found' });
    res.json(c);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { title, departmentId, year, description, order } = req.body;
    if (!title || !departmentId || !year) {
      return res.status(400).json({ message: 'title, departmentId, year required' });
    }
    const c = await Course.create({
      title,
      departmentId,
      year: Number(year),
      description: description || '',
      order: order ?? 0,
    });
    res.status(201).json(c);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { title, departmentId, year, description, order } = req.body;
    const c = await Course.findByIdAndUpdate(
      req.params.id,
      { title, departmentId, year, description, order },
      { new: true, runValidators: true }
    );
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
