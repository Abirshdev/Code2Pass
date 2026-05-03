import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    codeExamples: [{ type: String }],
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
