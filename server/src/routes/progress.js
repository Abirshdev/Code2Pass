import { Router } from 'express';
import mongoose from 'mongoose';
import CourseProgress from '../models/CourseProgress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import { authRequired, attachUser } from '../middleware/auth.js';
import { issueCertificateIfEligible } from '../utils/issueCertificate.js';

const router = Router();

router.get('/', authRequired, attachUser, async (req, res) => {
  try {
    const items = await CourseProgress.find({ userId: req.userId })
      .populate('courseId', 'title year departmentId')
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/course/:courseId', authRequired, attachUser, async (req, res) => {
  try {
    let p = await CourseProgress.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    }).lean();
    if (!p) {
      p = {
        userId: req.userId,
        courseId: req.params.courseId,
        completedLessonIds: [],
        courseCompleted: false,
      };
    }
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 }).select('_id').lean();
    const totalLessons = lessons.length;
    const completed = p.completedLessonIds?.length || 0;
    res.json({
      ...p,
      totalLessons,
      completedLessons: completed,
      percent: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/lesson-complete', authRequired, attachUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'courseId and lessonId required' });
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Course not found' });
    }

    let p = await CourseProgress.findOne({ userId: req.userId, courseId }).session(session);
    if (!p) {
      p = new CourseProgress({ userId: req.userId, courseId, completedLessonIds: [] });
    }
    const lid = new mongoose.Types.ObjectId(lessonId);
    if (!p.completedLessonIds.some((id) => id.equals(lid))) {
      p.completedLessonIds.push(lid);
    }

    const allLessons = await Lesson.find({ courseId }).session(session).select('_id').lean();
    const allIds = new Set(allLessons.map((l) => l._id.toString()));
    const done = p.completedLessonIds.filter((id) => allIds.has(id.toString())).length;

    if (allLessons.length > 0 && done >= allLessons.length) {
      p.courseCompleted = true;
      p.completedAt = new Date();
    }

    await p.save({ session });
    await session.commitTransaction();

    let certificate = null;
    if (p.courseCompleted) {
      certificate = await issueCertificateIfEligible({
        userId: req.userId,
        courseId,
        departmentId: course.departmentId,
        scorePercent: 100,
        reason: 'course_complete',
      });
    }

    res.json({
      progress: p.toObject(),
      courseCompleted: p.courseCompleted,
      certificate,
    });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: e.message });
  } finally {
    session.endSession();
  }
});

export default router;
