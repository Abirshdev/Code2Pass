import { Router } from 'express';
import Department from '../models/Department.js';
import { authRequired, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_, res) => {
  try {
    const items = await Department.find().sort({ name: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const d = await Department.findById(req.params.id).lean();
    if (!d) return res.status(404).json({ message: 'Department not found' });
    res.json(d);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Name and code required' });
    const d = await Department.create({ name, code, description: description || '' });
    res.status(201).json(d);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Department code exists' });
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const d = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description },
      { new: true, runValidators: true }
    );
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
