import { Router } from 'express';
import User from '../models/User.js';
import { authRequired, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id/role', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authRequired, attachUser, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
