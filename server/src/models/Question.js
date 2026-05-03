import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: '' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: true }
);

questionSchema.index({ courseId: 1 });

export default mongoose.model('Question', questionSchema);
