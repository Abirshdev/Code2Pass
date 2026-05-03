import { Router } from 'express';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { authRequired, attachUser } from '../middleware/auth.js';
import { buildCertificatePdfBuffer } from '../utils/pdfCertificate.js';

const router = Router();

const publicClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('userId', 'name')
      .lean();
    if (!cert) {
      return res.json({
        valid: false,
        status: 'Invalid',
        message: 'Certificate not found',
      });
    }
    res.json({
      valid: true,
      status: 'Valid',
      studentName: cert.userId?.name,
      course: cert.courseName,
      department: cert.departmentName,
      score: cert.score,
      certificateId: cert.certificateId,
      issueDate: cert.issueDate,
      reason: cert.reason,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/mine', authRequired, attachUser, async (req, res) => {
  try {
    const items = await Certificate.find({ userId: req.userId })
      .sort({ issueDate: -1 })
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:certificateId/pdf', authRequired, attachUser, async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.certificateId,
      userId: req.userId,
    }).lean();
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    const user = await User.findById(req.userId).lean();
    const verifyUrl = `${publicClientUrl().replace(/\/$/, '')}/verify/${encodeURIComponent(cert.certificateId)}`;
    const buf = await buildCertificatePdfBuffer({
      studentName: user?.name || 'Student',
      courseName: cert.courseName,
      departmentName: cert.departmentName,
      score: cert.score,
      certificateId: cert.certificateId,
      issueDate: cert.issueDate,
      verifyUrl,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
    res.send(buf);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
