import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    courseCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('CourseProgress', courseProgressSchema);
